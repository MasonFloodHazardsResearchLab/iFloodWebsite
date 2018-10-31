//force browser to load preloader image in advance even though it isn't displayed anywhere yet
let preloadTheLoader = new Image();
preloadTheLoader.src = "tail-spin.svg";

let currentGMUDirectory = "";
let currentDownloadDirectory = "";

let lastForecast = moment("2017122000", "YYYYMMDDHH").utc();
let thisHour = 0;
let currentHourSetting = 0;

let map;
let currentInfoWindow = null;

const domLayerBar = $('#mapLayerBar');
const domLayerInfo = $('#layerInfo');
const domLayerTiles = $('#layerTiles');
const domMapScales = $('#mapScales');
const domPlaceButtons = $('#placeButtons');

const mapOverlayCanvas = document.getElementById("mapOverlayCanvas");
let particleBoundary;

const timeSlideContainer = document.getElementById("timeSlideContainer");
const timeSlider = document.getElementById("timeSlider");
const sliderBGCanvas = document.getElementById("timeSliderBG");
const sliderHandleCanvas = document.getElementById("timeSliderHandle");

let templateIDCounter = 0;
$.views.helpers("uniqueID", function() { return templateIDCounter++; });

const templateLayerInfo = $.templates("#templateLayerInfo");
const templateLayerTile = $.templates("#templateLayerTile");
const templatePopupTabs = $.templates("#templatePopupTabs");
const templatePlaceButton = $.templates("#templatePlaceButton");
const templateHurricaneInfo = $.templates("#templateHurricaneInfo");

const hurricaneTimezones = {
    "UTC":"+00:00",
    "AST":"-04:00",
    "ADT":"-03:00",
    "CT":"-06:00",
    "CDT":"-05:00",
    "EST":"-05:00",
    "ET":"-05:00",
    "EDT":"-04:00",
};

let activeDataRequests = {};

map = new google.maps.Map(document.getElementById('map'), {
    zoom: 8,
    gestureHandling: 'greedy',
    mapTypeId: 'roadmap',
    center: {lat: 38.2, lng: -76.325},
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    //mapTypeControl: false,
    styles: mapstyle
});

function init() {
    let groupDivs = [];
    for (let i = 0; i < layerGroups.length; i++) {
        domLayerTiles.append($('<div>',{
            "class":"layerGroupDivider",
            "text":layerGroups[i]
        }));
        groupDivs[i] = $('<div>',{
            "class":"layerGroupContainer"
        }).appendTo(domLayerTiles);
    }
    //create layer groups
    for (let layerIndex in layers) {
        if (!layers.hasOwnProperty(layerIndex))
            continue;
        let layer = layers[layerIndex];
        //create info bar
        let newItem = $(templateLayerInfo.render(layer)).css({
            display: "none"
        }).appendTo(domLayerInfo);
        newItem.find(".dataButton").attr("href",layer["downloadUrl"].replace("{_CURRENT_GMU_}",currentGMUDirectory).replace("{_CURRENT_DOWNLOAD_}",currentDownloadDirectory));
        if (layer["type"] === "geoJSON") {
            //add data array
            layer["data"] = [];
            layer["showing"] = null;
            //draw spectrum bar
            let spectrumCanvas = newItem.find(".infoCanvas")[0];
            if (spectrumCanvas) {
                let ctx = spectrumCanvas.getContext('2d');
                for (let i = 0; i < 80; i++) {
                    ctx.fillStyle = getColorPoint(layer["colorRange"], i / 80);
                    ctx.fillRect(i, 0, 1, 20);
                }
            }
            //add scale canvas to map
            layer["scaleCanvas"] = $('<canvas class="scaleCanvas" width="60" height="200">').appendTo(domMapScales)[0];
            layer["scaleCanvasContext"] = layer["scaleCanvas"].getContext('2d');
            drawScaleBar(layer);
        }
        let particleCheckbox = newItem.find(".particleToggle");
        let closeButton = newItem.find(".closeButton");
        //create tile
        let newTile = $(templateLayerTile.render(layer)).appendTo(groupDivs[layer["group"]]);
        newTile.click(function () {
            newTile.addClass("loading");
            showLayer(layer, function (worked) {
                newTile.removeClass("loading");
                if (worked) {
                    newTile.css({
                        display: "none"
                    });
                    newItem.appendTo(domLayerInfo).css({ //move to end of list
                        display: "block"
                    });
                    $(layer["scaleCanvas"]).appendTo(domMapScales).css({ //move to end of list
                        display: "block"
                    });
                    if (particleCheckbox.prop("checked"))
                        showParticles(layer);
                }
                else {
                    newTile.addClass("error");
                    $('#layerErrorBox').addClass('show');
                }
            });
        });
        closeButton.click(function () {
            hideLayer(layer);
            newTile.css({
                display: "block"
            });
            newItem.css({
                display: "none"
            });
            if (layer["scaleCanvas"])
                layer["scaleCanvas"].style.display = "none";
        });
        particleCheckbox.change(function() {
            if(this.checked) {
                showParticles(layer);
            }
            else {
                hideParticles(layer)
            }
        });
    }

    for (let markerIndex in markers) {
        if (!markers.hasOwnProperty(markerIndex))
            continue;
        let marker = markers[markerIndex];
        marker["gMarker"] = new google.maps.Marker({
            map: map,
            draggable: false,
            title: marker["title"],
            position: marker["pos"]
        });
        marker["gMarker"].addListener('click', function () {
            if (currentInfoWindow) {
                currentInfoWindow.close();
                Plotly.purge(currentInfoWindow.content);
            }
            let domPlot = $('<div>', {
                class: "mapPopupContainer"
            });
            let infoWindow = new google.maps.InfoWindow({
                content: domPlot[0]
            });
            currentInfoWindow = infoWindow;
            infoWindow.addListener('closeclick', function () {
                currentInfoWindow = null;
                Plotly.purge(domPlot.find("#mapPopupContent1")[0]);
                //Plotly.purge(domPlot.find("#mapPopupContent2")[0]);
                Plotly.purge(domPlot.find("#mapPopupContent3")[0]);
                $(timeSlideContainer).removeClass("mobileHide");
                drawTimeSlide();
            });
            infoWindow.open(map, marker["gMarker"]);
            $(timeSlideContainer).addClass("mobileHide");
            if (typeof marker["timeSeriesUrl"] !== 'undefined') {
                $(templatePopupTabs.render()).appendTo(domPlot);
                makePlotStationTimeseries(marker["timeSeriesUrl"].replace("{_CURRENT_GMU_}",currentGMUDirectory), domPlot.find("#mapPopupContent1")[0], marker["floodLevels"],marker["title"]+": Water Level");
                if (marker["hasWind"]) {
                    domPlot.find("#mapPopupContent2").append($('<img>',{
                        "class":"plotImg",
                        "src":currentGMUDirectory+"/WindPhotos/"+marker["stationStr"]+"_wind.png",
                    }));
                }
                else {
                    domPlot.find("#mapPopupContent2").append($('<div>',{
                        "class": "centerNote",
                        "text": "No wind observation gauge installed at the Station"
                    }));
                }
                makePlotStationValidation(stationValidationUrl.replace("{_CURRENT_GMU_}",currentGMUDirectory), domPlot.find("#mapPopupContent3")[0], marker["stationStr"], marker["title"]+": Validation");
                for (let i = 1; i < 4; i++) {
                    domPlot.find("#mapPopupTab" + i).click(function () {
                        for (let j = 1; j < 4; j++) {
                            if (j === i) {
                                domPlot.find("#mapPopupContent" + j).css({"display": "block"});
                                domPlot.find("#mapPopupTab" + j).addClass("current");
                            }
                            else {
                                domPlot.find("#mapPopupContent" + j).css({"display": "none"});
                                domPlot.find("#mapPopupTab" + j).removeClass("current");
                            }
                        }
                        window.dispatchEvent(new Event('resize')); //plotly doesn't always realize it needs to resize
                    });
                }
                setTimeout(function() {window.dispatchEvent(new Event('resize'));}, 50);
            }
            else if (typeof marker["notice"] !== 'undefined') {
                domPlot[0].innerHTML = marker["notice"];
            }
        });
    }
    //set icons
    $.get(currentGMUDirectory+"/GeoJson/Floodlevels.json",function(markerLevels) {
        for (let markerIndex in markers) {
            if (!markers.hasOwnProperty(markerIndex))
                continue;
            let marker = markers[markerIndex];
            if (markerLevels.hasOwnProperty(marker["stationStr"])) {
                let iconUrl;
                switch (markerLevels[marker["stationStr"]]["Flood Level"]) {
                    case "Action":
                        iconUrl = "/map/sprites/markers/action.svg";
                        break;
                    case "Minor":
                        iconUrl = "/map/sprites/markers/minor.svg";
                        break;
                    case "Moderate":
                        iconUrl = "/map/sprites/markers/moderate.svg";
                        break;
                    case "Major":
                        iconUrl = "/map/sprites/markers/major.svg";
                        break;
                    default:
                        iconUrl = "/map/sprites/markers/default.svg";
                        break;
                }
                marker["gMarker"].setIcon({
                    "url": iconUrl,
                    "anchor": new google.maps.Point(25, 65),
                    "scaledSize": new google.maps.Size(50, 67),
                });
            }
        }
    });

    for (let placeIndex in places) {
        if (!places.hasOwnProperty(placeIndex))
            continue;
        let place = places[placeIndex];
        let newButton = $(templatePlaceButton.render(place)).appendTo(domPlaceButtons);
        newButton.click(function() {
            map.panTo(place["pos"]);
            map.setZoom(place["zoom"]);
        });
    }

    let zoomTimeout; //wait for the user to stop zooming before updating layers, since it sometimes freezes the main thread
    google.maps.event.addListener(map, 'zoom_changed', function() {
        clearTimeout(zoomTimeout);
        zoomTimeout = setTimeout(updateZoom, 600);
    });

    map.addListener('click', function() {
        if (currentInfoWindow) {
            currentInfoWindow.close();
            Plotly.purge($(currentInfoWindow.content).find("#mapPopupContent1")[0]);
            Plotly.purge($(currentInfoWindow.content).find("#mapPopupContent3")[0]);
            $(timeSlideContainer).removeClass("mobileHide");
            drawTimeSlide();
        }
    });

    map.addListener('bounds_changed',function() {
        overCtx.clearRect(0,0,mapOverlayCanvas.width,mapOverlayCanvas.height);
        overCtx.fillStyle = "rgba(255,255,255,0.06)";
        overCtx.fillRect(0,0,mapOverlayCanvas.width,mapOverlayCanvas.height);
    });

    particleBoundary = new google.maps.Polygon();
    $.get(dataDomain + "/boundary/ModelBoundaryPoly.json", function (boundaryData) {
        let theDataLayer = new google.maps.Data();
        theDataLayer.addGeoJson(boundaryData);
        theDataLayer.forEach(function (feature) {
            let geom = feature.getGeometry();
            particleBoundary = new google.maps.Polygon({
                paths: geom.getAt(0).getArray(),
                clickable: false
            });
        });
        overCtx.fillStyle = "rgba(255,255,255,0.05)";
        overCtx.fillRect(0,0,mapOverlayCanvas.width,mapOverlayCanvas.height);
        mapOverlayCanvas.style.display = "none";
        drawOverlay();
    });
}

//load up most recent predictions
$.get(dataDomain+"/Forecast/recent.txt?v="+Math.round(Math.random()*100000000).toString(), function( recentRun ) {
    console.log(recentRun);
    lastForecast = moment.utc(recentRun, "YYYYMMDDHH");
    thisHour = moment().diff(lastForecast, 'H');
    currentHourSetting = thisHour;
    currentGMUDirectory = dataDomain+"/Forecast/"+recentRun;
    currentDownloadDirectory = dataDomain+"/?prefix=Forecast/"+recentRun;
    $('#modelInfo').text("iFlood data generated "+lastForecast.format("HH:mm [UTC,] YYYY-MM-DD")+". Third party data may be older.");
    drawTimeSlide();
    init();
});

//---   interface   ---
//expand button for mobile
$('#expandButton').click(function() {
    domLayerBar.toggleClass('expanded');
});

//time slider
let sliderGrabbed = false;
let sliderMouseIn = false;
let sliderTimeout = null;
function sliderShowHidePopup() {
    if (sliderGrabbed || sliderMouseIn)
        $('#timePopup').addClass("show");
    else
        $('#timePopup').removeClass("show");
}
function sliderDelay() {
    if (sliderTimeout === null) {
        if (sliderTimeout === null) {
            sliderTimeout = setTimeout(function () {
                updateTime();
                sliderTimeout = null;
            }, 300);
        }
    }
}
timeSlider.addEventListener('mouseover',function() {
    sliderMouseIn = true;
    sliderShowHidePopup();
});
timeSlider.addEventListener('mouseout',function() {
    sliderMouseIn = false;
    sliderShowHidePopup();
});
let sliderGrabHandler = function(event) {
    let xpos = event.clientX || event.touches[0].clientX;
    sliderGrabbed = true;
    event.preventDefault();
    let gridWidth = sliderBGCanvas.width/(83+4);
    currentHourSetting = Math.max(Math.min(Math.round((xpos-sliderBGCanvas.getBoundingClientRect().left)*window.devicePixelRatio/gridWidth - 2),83),0);
    drawTimeSlide();
    sliderShowHidePopup();
    sliderDelay();
};
timeSlider.addEventListener("mousedown", sliderGrabHandler);
timeSlider.addEventListener("touchstart", sliderGrabHandler);
document.addEventListener("mouseup", function() {
    sliderGrabbed = false;
    sliderShowHidePopup();
});
document.addEventListener("mouseleave", function(event) {
    sliderGrabbed = false;
    sliderShowHidePopup();
});
let sliderMovedHandler = function(event) {
    let xpos;
    if (typeof event.clientX !== "undefined")
        xpos = event.clientX;
    else
        xpos = event.touches[0].clientX;
    if (typeof event.buttons !== 'undefined' && event.buttons === 0) {
        sliderGrabbed = false;
    }
    if (sliderGrabbed) {
        let gridWidth = sliderBGCanvas.width/(83+4);
        currentHourSetting = Math.max(Math.min(Math.round((xpos-sliderBGCanvas.getBoundingClientRect().left)*window.devicePixelRatio/gridWidth - 2),83),0);
        drawTimeSlide();
        sliderDelay();
    }
};
document.addEventListener("mousemove", sliderMovedHandler);
document.addEventListener("touchmove", sliderMovedHandler);
document.addEventListener("touchend", function() {
    sliderGrabbed = false;
    $('#timePopup').removeClass("show");
});
window.addEventListener("resize",function() {
    drawTimeSlide();
});

//animate time
let playButton = $('#playPauseButton');
let animationPlaying = false;
let animationTimeout = null;
//TODO: frameskip when internet is slow
function stepTime() {
    currentHourSetting += 1;
    if (currentHourSetting > 83)
        currentHourSetting -= 83;
    drawTimeSlide();
    let promises = updateTime();
	$.when.apply($, promises).then(function() {
		if (animationPlaying)
			animationTimeout = setTimeout(stepTime, 200);
	});
}
playButton.click(function() {
    if (animationPlaying) {
        animationPlaying = false;
        playButton.removeClass("pause");
        playButton.addClass("play");
        clearTimeout(animationTimeout);
    }
    else {
        animationPlaying = true;
        playButton.removeClass("play");
        playButton.addClass("pause");
		animationTimeout = stepTime();
    }
});

//messageBoxes
function showMessageBox(id) {
    $('#'+id).addClass('show');
    $('#messageBoxFade').addClass('show');
}
$('.messageBox .dismissButton').click(function() {
    $(this).parent().removeClass('show');
    $('#messageBoxFade').removeClass('show');
});
//show warning
showMessageBox("welcomeMessageBox");


//map data/helpers
$.colors.defaultModel = "RGB";
//get color of a specific point in a color range
function getColorPoint(range, point) {
    if (point <= range[0][0])
        return range[0][1];
    if (point >= range[range.length-1][0])
        return range[range.length-1][1];
    let firstColor = 0;
    while (firstColor !== range.length-2 && range[firstColor+1][0] < point) {
        firstColor++;
    }
    let baseStrength = 1-((point-range[firstColor][0])/(range[firstColor+1][0]-range[firstColor][0]));
    return $.colors(range[firstColor][1]).mixWith(range[firstColor+1][1], baseStrength).toString();
}

function hurricaneMapPoints(layer) {
    for (let stormID in layer["stormGPoints"]) {
        if (!layer["stormGPoints"].hasOwnProperty(stormID))
            continue;
        let mostRecentStormPoint = 0;
        for (let i = 0; i < layer["storms"][stormID].length; i++) {
            if (layer["storms"][stormID][i]["time"].isAfter(lastForecast.clone().add(currentHourSetting, 'hours')))
                break;
            else
                mostRecentStormPoint = i;
        }
        layer["stormGPoints"][stormID].setPosition(layer["storms"][stormID][mostRecentStormPoint]["pos"]);
        if (layer["storms"][stormID][mostRecentStormPoint]["type"] === "HU") {
            layer["stormGPoints"][stormID].setIcon({
                "url": "/map/sprites/hurricane.svg",
                "anchor": new google.maps.Point(20, 20),
                "scaledSize": new google.maps.Size(40, 40),
            })
        }
        else if (layer["storms"][stormID][mostRecentStormPoint]["type"] === "TS" || layer["storms"][stormID][mostRecentStormPoint]["type"] === "STS") {
            layer["stormGPoints"][stormID].setIcon({
                "url": "/map/sprites/storm.svg",
                "anchor": new google.maps.Point(20, 20),
                "scaledSize": new google.maps.Size(40, 40),
            })
        }
        else {
            layer["stormGPoints"][stormID].setIcon({
                "url": "/map/sprites/depression.svg",
                "anchor": new google.maps.Point(20, 20),
                "scaledSize": new google.maps.Size(40, 40),
            })
        }
        google.maps.event.clearListeners(layer["stormGPoints"][stormID], 'mouseover');
        google.maps.event.addListener(layer["stormGPoints"][stormID], 'mouseover',function() {
            layer["infoWindow"].setContent($(templateHurricaneInfo.render(layer["storms"][stormID][mostRecentStormPoint]))[0]);
            layer["infoWindow"].open(map, layer["stormGPoints"][stormID]);
        });
        google.maps.event.clearListeners(layer["stormGPoints"][stormID], 'mouseout');
        google.maps.event.addListener(layer["stormGPoints"][stormID], 'mouseout',function() {
           layer["infoWindow"].close();
        });
    }
}

//show a layer
function showLayer(layer, oncomplete) {
    layer["visible"] = true;
    if (layer["type"] === "geoJSON") {
        let index = getZoomDataIndex(layer, map.getZoom());
        showData(layer, index, currentHourSetting, oncomplete);
    }
    else if (layer["type"] === "outline") {
        if (!layer["data"]) {
            let fileUrl = layer["url"].replace("{_CURRENT_GMU_}",currentGMUDirectory);
            if (activeDataRequests.hasOwnProperty(fileUrl)) {
				if (oncomplete) {
					oncomplete(true);
				}
				return;
            }
			activeDataRequests[fileUrl] = $.get(fileUrl, function( retrievedJSON ) {
				delete activeDataRequests[fileUrl];
                let theDataLayer = new google.maps.Data();
                layer["data"] = theDataLayer;
                theDataLayer.addGeoJson(retrievedJSON);
                theDataLayer.setStyle(function (feature) {
                    return {
                        fillOpacity: 0,
                        strokeWeight: 2,
                        strokeColor: layer["color"],
                        zIndex: layer["z"]
                    };
                });
                theDataLayer.setMap(map);
                if (oncomplete) {
                    oncomplete(true);
                }
            }).fail(function() {
				delete activeDataRequests[fileUrl];
                layer["visible"] = false;
                if (oncomplete) {
                    oncomplete(false);
                }
            });
        }
        else {
            layer["visible"] = true;
            layer["data"].setMap(map);
            if (oncomplete) {
                oncomplete(true);
            }
        }
    }
    else if (layer["type"] === "stormPath") {
        if (!layer["data"]) {
            let pointUrl = layer["pointUrl"].replace("{_CURRENT_GMU_}",currentGMUDirectory);
			let pathUrl = layer["pathUrl"].replace("{_CURRENT_GMU_}",currentGMUDirectory);
			let polygonUrl = layer["polygonUrl"].replace("{_CURRENT_GMU_}",currentGMUDirectory);
			$.when(
			    $.get(pointUrl),
                $.get(pathUrl),
                $.get(polygonUrl)
            ).then(function(pointRequest, pathRequest, polygonRequest) {
                let pointJSON = pointRequest[0];
                let pathJSON = pathRequest[0];
                let polygonJSON = polygonRequest[0];
                let theDataLayer = new google.maps.Data();
                layer["data"] = theDataLayer;
                layer["infoWindow"] = new google.maps.InfoWindow();
                theDataLayer.setStyle(function (feature) {
                    if (feature.getGeometry() instanceof google.maps.Data.Polygon) {
                        return {
                            clickable: false,
                            fillOpacity: 1,
                            fillColor: "rgba(0,0,0,0.05)",
                            strokeWeight: 1,
                            strokeColor: "rgba(0,0,0,0.2)",
                            zIndex: layer["z"]
                        };
                    }
                    else {
                        return {
                            fillOpacity: 0,
                            strokeWeight: 1,
                            strokeColor: "rgba(0,0,0,0.5)",
                            icon: {
                                "url": "/map/sprites/point.png",
                                "anchor": new google.maps.Point(4, 4)
                            },
                            zIndex: layer["z"]
                        };
                    }
                });
                theDataLayer.addGeoJson(pointJSON);
			    layer["storms"] = {};
			    layer["stormGPoints"] = {};
			    for (let i = 0; i < pointJSON["features"].length; i++) {
			        let thisPoint = pointJSON["features"][i]["properties"];
			        if (typeof layer["storms"][thisPoint["STORMNUM"].toString()] === 'undefined') {
                        layer["storms"][thisPoint["STORMNUM"].toString()] = [];
                        layer["stormGPoints"][thisPoint["STORMNUM"].toString()] = new google.maps.Marker({
                            map: map,
                            zIndex: 10
                        });
                    }
                    let stormMoment = moment.utc(thisPoint["FLDATELBL"]+" "+hurricaneTimezones[thisPoint["TIMEZONE"]],"YYYY-MM-DD hh:mm a ddd [???] ZZ");
			        layer["storms"][thisPoint["STORMNUM"].toString()].push({
                        "pos":{
                            lat: thisPoint["LAT"],
                            lng: thisPoint["LON"]
                        },
                        "time":stormMoment,
                        "type":thisPoint["STORMTYPE"],
                        "name":thisPoint["STORMNAME"],
                        "maxwind":thisPoint["MAXWIND"],
                        "gusts":thisPoint["GUST"],
                        "pressure":thisPoint["MSLP"]
                    });
                }
                theDataLayer.addGeoJson(pathJSON);
                theDataLayer.addGeoJson(polygonJSON);
                hurricaneMapPoints(layer);
                theDataLayer.setMap(map);
                if (oncomplete) {
                    oncomplete(true);
                }
            }).fail(function(a,b,c) {
                console.log(a,b,c);
                layer["visible"] = false;
                if (oncomplete) {
                    oncomplete(false);
                }
            });
        }
        else {
            layer["visible"] = true;
            layer["data"].setMap(map);
            for (let stormID in layer["stormGPoints"]) {
                if (!layer["stormGPoints"].hasOwnProperty(stormID))
                    continue;
                layer["stormGPoints"][stormID].setMap(map);
            }
            hurricaneMapPoints(layer);
            if (oncomplete) {
                oncomplete(true);
            }
        }
    }
    else if (layer["type"] === "wmsTile") {
        if (!layer.hasOwnProperty("mapObj")) {
            layer["mapObj"] = new google.maps.ImageMapType({
                getTileUrl: function (coord, zoom) {
                    let proj = map.getProjection();
                    let zfactor = Math.pow(2, zoom);
                    // get Long Lat coordinates
                    let top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
                    let bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));

                    //corrections for the slight shift of the data
                    let deltaX = 0;
                    let deltaY = 0;

                    //create the Bounding box string
                    let bbox = (top.lng() + deltaX) + "," +
                        (bot.lat() + deltaY) + "," +
                        (bot.lng() + deltaX) + "," +
                        (top.lat() + deltaY);

                    //base WMS Url
                    let url = layer["url"];
                    url += "&REQUEST=GetMap"; //WMS operation
                    url += "&SERVICE=WMS";    //WMS service
                    url += "&VERSION=1.1.1";  //WMS version
                    url += "&LAYERS=" + "precimg"; //WMS layers
                    url += "&FORMAT=image/png"; //WMS format
                    url += "&BGCOLOR=0xFFFFFF";
                    url += "&TRANSPARENT=TRUE";
                    url += "&SRS=EPSG:4326";     //set WGS84
                    url += "&BBOX=" + bbox;      // set bounding box
                    url += "&WIDTH=256";         //tile size in google
                    url += "&HEIGHT=256";
                    return url;                 // return Url for the tile

                },
                tileSize: new google.maps.Size(256, 256),
                isPng: true
            });
        }
        map.overlayMapTypes.push(layer["mapObj"]);
        oncomplete(true);
    }
    else if (layer["type"] === "arcGIS") {
        if (typeof layer["arcMap"] === 'undefined') {
            let ms = new gmaps.ags.MapService(layer["url"]);
            let tl = new gmaps.ags.TileLayer(ms);
            layer["arcMap"] = new gmaps.ags.MapType(tl);
            google.maps.event.addListener(ms, 'load', function () {
                for (let msLayer in ms.layers) {
                    if (msLayer != layer['gisLayer'])
                        ms.layers[msLayer].visible = false;
                }
                map.overlayMapTypes.push(layer["arcMap"]);
                oncomplete(true);
            });
        }
        else {
            map.overlayMapTypes.push(layer["arcMap"]);
            oncomplete(true);
        }
    }
    else if (layer["type"] === "cachedTile") {
        if (typeof layer["tileMap"] === 'undefined') {
            layer["tileMap"] = new google.maps.ImageMapType({
                getTileUrl: function(coord, zoom) {
                    return layer["url"] + zoom + "_" + coord.x + "_" + coord.y + ".png";
                },
                tileSize: new google.maps.Size(256, 256),
                isPng: true,
                opacity: 0.6
            });
        }
        map.overlayMapTypes.push(layer["tileMap"]);
        oncomplete(true);
    }
}

//show a specific time/zoom level for a geoJSON layer
function showData(layer, dataIndex, timeIndex, oncomplete) {
    if (layer["temporal"])
        layer["showing"] = [dataIndex,timeIndex];
    else
        layer["showing"] = dataIndex;
    if (!layer["data"][dataIndex]
    || (layer["temporal"] && !layer["data"][dataIndex][timeIndex])
    ) {
        let fileUrl = layer["urls"][dataIndex][1].replace("{_CURRENT_GMU_}",currentGMUDirectory);
        if (layer["temporal"]) {
            fileUrl = fileUrl.replace("{_h_}", (timeIndex+1).toString());
        }
        let planningToShow = layer["showing"];
		if (activeDataRequests.hasOwnProperty(fileUrl)) {
			if (oncomplete) {
				oncomplete(true);
			}
			return;
		}
		activeDataRequests[fileUrl] = $.get(fileUrl, function( retrievedJSON ) {
			delete activeDataRequests[fileUrl];
            //make sure this file hasn't already been loaded somehow
            if (
                (layer["temporal"] && layer["data"][dataIndex] && layer["data"][dataIndex][timeIndex])
             || (!layer["temporal"] && layer["data"][dataIndex])
            ) {
				if (oncomplete) {
					oncomplete(true);
				}
				return;
            }

            let theDataLayer = new google.maps.Data();
            if (layer["temporal"]) {
                if (typeof layer["data"][dataIndex] === 'undefined')
                    layer["data"][dataIndex] = [];
                layer["data"][dataIndex][timeIndex] = theDataLayer;
            }
            else {
                layer["data"][dataIndex] = theDataLayer;
            }
            theDataLayer.addGeoJson(retrievedJSON);
            theDataLayer.setStyle(function (feature) {
                let level = (feature.getProperty(layer["colorProperty"])-layer["colorBounds"][0])/(layer["colorBounds"][1]-layer["colorBounds"][0]);
                let color = getColorPoint(layer["colorRange"], level);
                if (layer["borderFix"]) {
                    return {
                        fillColor: color,
                        fillOpacity: 1,
                        strokeColor: color,
                        strokeWeight: 1,
                        zIndex: layer["z"]
                    };
                }
                else {
                    return {
                        fillColor: color,
                        fillOpacity: 0.8,
                        strokeWeight: 0,
                        zIndex: layer["z"]
                    };
                }
            });
            google.maps.event.addListener(theDataLayer, 'mouseover', function(event) {
                drawScaleBar(layer,event.feature.getProperty(layer["colorProperty"]));
            });
            //show this data only if it's still the correct one
            if (JSON.stringify(planningToShow) === JSON.stringify(layer["showing"]) && layer["visible"]) {
                theDataLayer.setMap(map);
                if (layer["temporal"])
                    hideAllData(layer, [dataIndex, timeIndex]);
                else
                    hideAllData(layer, dataIndex);
            }
            if (oncomplete) {
                oncomplete(true);
            }
        }).fail(function() {
			delete activeDataRequests[fileUrl];
            layer["visible"] = false;
            if (oncomplete) {
                oncomplete(false);
            }
        });
		return activeDataRequests[fileUrl];
    }
    else {
        layer["visible"] = true;
        if (layer["temporal"]) {
            layer["data"][dataIndex][timeIndex].setMap(map);
            hideAllData(layer, [dataIndex, timeIndex]);
        }
        else {
            layer["data"][dataIndex].setMap(map);
            hideAllData(layer, dataIndex);
        }
        if (oncomplete) {
            oncomplete(true);
        }
    }
}

function hideLayer(layer) {
    layer["visible"] = false;
    if (layer["type"] === "geoJSON") {
        hideAllData(layer);
        if (layer["temporal"]) {
            for (let i = 0; i < 84; i++) {
                if (layer["data"][layer["showing"][0]][i]) {
                    layer["data"][layer["showing"][0]][i] = null;
                }
            }
        }
        if (layer["hasParticles"]) {
            hideParticles(layer);
        }
    }
    else if (layer["type"] === "outline") {
        layer["data"].setMap(null);
    }
    else if (layer["type"] === "stormPath") {
        layer["data"].setMap(null);
        for (let stormID in layer["stormGPoints"]) {
            if (!layer["stormGPoints"].hasOwnProperty(stormID))
                continue;
            layer["stormGPoints"][stormID].setMap(null);
        }
    }
    else if (layer["type"] === "wmsTile") {
        map.overlayMapTypes.pop(layer["mapObj"]);
    }
    else if (layer["type"] === "arcGIS") {
        map.overlayMapTypes.pop(layer["arcMap"]);
    }
    else if (layer["type"] === "cachedTile") {
        map.overlayMapTypes.pop(layer["tileMap"]);
    }
}

function getZoomDataIndex(layer, level) {
    for (let i = 0; i < layer["urls"].length; i++) {
        if (layer["urls"][i][0] > level)
            return i-1;
    }
    return layer["urls"].length-1;
}

function hideAllData(layer, except) {
    if (layer["temporal"]) {
        for (let i = 0; i < layer["data"].length; i++) {
            if (layer["data"][i]) {
                for (let j = 0; j < layer["data"][i].length; j++) {
                    if (layer["data"][i][j]
                    && (typeof except === 'undefined' || except[0] !== i || except[1] !== j)
                    ) {
                        layer["data"][i][j].setMap(null);
                    }
                }
            }
        }
    }
    else {
        for (let i = 0; i < layer["data"].length; i++) {
            if (layer["data"][i]
            && (typeof except === 'undefined' || except !== i)
            ) {
                layer["data"][i].setMap(null);
            }
        }
    }
}

function updateZoom() {
    let zoomLevel = map.getZoom();
    for (let layerIndex in layers) {
        let layer = layers[layerIndex];
        if (layer["visible"] && layer["type"] === "geoJSON") {
            let index = getZoomDataIndex(layer, map.getZoom());
            if ((layer["temporal"] && layer["showing"][0] !== index) || (!layer["temporal"] && layer["showing"] !== index)) {
                showData(layer, index, currentHourSetting);
            }
        }
    }
}

function updateTime() {
    let promises = [];
    for (let layerIndex in layers) {
        let layer = layers[layerIndex];
        if (layer["visible"] && layer["type"] === "geoJSON" && layer["temporal"]) {
            //remove data thats far away from the current time to free up some RAM
            for (let i = 0; i < 84; i++) {
                if (layer["data"][layer["showing"][0]] && layer["data"][layer["showing"][0]][i] &&
                    (i-layer["showing"][1] < -2 || i-layer["showing"][1] > 6)
                ) {
                    layer["data"][layer["showing"][0]][i].setMap(null);
                    layer["data"][layer["showing"][0]][i] = null;
                }
            }
            //show data for current time
            if (layer["showing"][1] !== currentHourSetting) {
                let returnValue = showData(layer, layer["showing"][0], currentHourSetting);
                if (returnValue)
					promises.push(returnValue);
            }
        }
        if (layer["visible"] && layer["type"] === "geoJSON" && layer["hasParticles"] && layer["particlesRunning"]) {
            setParticleFile(layer);
        }
        else if (layer["visible"] && layer["type"] === "stormPath") {
            hurricaneMapPoints(layer)
        }
    }
    return promises;
}

function drawScaleBar(layer, current) {
    let context = layer["scaleCanvasContext"];

    context.clearRect(0,0,60,200);
    context.fillStyle = "rgba(255,255,255,0.6)";
    context.fillRect(0, 0, 60, 200);
    if (layer["reverseBar"]) {
        for (let i = 0; i < 185; i++) {
            context.fillStyle = getColorPoint(layer["colorRange"], 1-(i/185));
            context.fillRect(0, i, 20, 1);
        }
    }
    else {
        for (let i = 0; i < 185; i++) {
            context.fillStyle = getColorPoint(layer["colorRange"], i/185);
            context.fillRect(0, i, 20, 1);
        }
    }
    let currentAdjusted;
    if (typeof current !== 'undefined') {
        currentAdjusted = (current-layer["colorBounds"][0])/(layer["colorBounds"][1]-layer["colorBounds"][0]);
        if (layer["reverseBar"])
            currentAdjusted = 1-currentAdjusted;
        context.fillStyle = "rgba(0,0,0,0.8)";
        context.fillRect(0, Math.floor(currentAdjusted*185), 20, 1);
    }
    context.fillStyle = "#000000";
    context.font = "10px Mukta";
    context.textAlign = "left";
    if (layer["reverseBar"]) {
        if (typeof current === 'undefined' || currentAdjusted > 0.08)
            context.fillText(layer["colorBounds"][1].toString(), 22, 10);
        if (typeof current === 'undefined' || currentAdjusted < 0.92)
            context.fillText(layer["colorBounds"][0].toString(), 22, 183);
    }
    else {
        if (typeof current === 'undefined' || currentAdjusted > 0.08)
            context.fillText(layer["colorBounds"][0].toString(), 22, 10);
        if (typeof current === 'undefined' || currentAdjusted < 0.92)
            context.fillText(layer["colorBounds"][1].toString(), 22, 183);
    }
    if (typeof current !== 'undefined') {
        context.font = "bold 10px Mukta";
        context.fillText(current.toString(), 22, Math.floor(Math.min(Math.max(currentAdjusted, 0.03), 0.96) * 185)+5);
    }

    context.fillStyle = "rgba(255,255,255,0.6)";
    context.fillRect(0, 185, 60, 15);
    context.fillStyle = "#000000";
    context.font = "12px Mukta";
    context.textAlign = "center";
    context.fillText(layer["unit"].toString(),30,196);
}

function drawTimeSlide() {
    let bgCtx = sliderBGCanvas.getContext("2d");
    let handleCtx = sliderHandleCanvas.getContext("2d");

    sliderBGCanvas.width = timeSlider.clientWidth*window.devicePixelRatio;
    sliderBGCanvas.height = timeSlider.clientHeight*window.devicePixelRatio;

    sliderHandleCanvas.width = 20*window.devicePixelRatio;
    sliderHandleCanvas.height = 20*window.devicePixelRatio;

    bgCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    handleCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    let gridWidth = timeSlider.clientWidth/(83+4);

    bgCtx.clearRect(0,0,sliderBGCanvas.width,sliderBGCanvas.height);
    handleCtx.clearRect(0,0,sliderHandleCanvas.width,sliderHandleCanvas.height);

    bgCtx.fillStyle = "#FFFFFF";
    //sides
    bgCtx.fillRect(gridWidth*2-1,12,2,10);
    bgCtx.fillRect(gridWidth*85-1,12,2,10);
    //current hour
    bgCtx.fillRect(gridWidth*(2+thisHour)-1,12,2,10);
    //top
    bgCtx.fillRect(gridWidth*2-1,12,gridWidth*83+1,2);
    //text
    bgCtx.font = "12px Mukta";
    bgCtx.textAlign = "center";
    bgCtx.fillStyle = "#FFFFFF";
    let timeString;
    if (currentHourSetting-thisHour > 0)
        timeString = "+" + (currentHourSetting-thisHour).toString() + " hr";
    else if (currentHourSetting-thisHour < 0)
        timeString = currentHourSetting-thisHour + " hr";
    else
        timeString = "now";
    bgCtx.fillText(
        timeString,
        Math.max(20,Math.min(timeSlider.clientWidth-20,gridWidth*(2+currentHourSetting)-1)),
        35
    );

    sliderHandleCanvas.style.left = (gridWidth*(2+currentHourSetting))-10 + "px";
    handleCtx.fillStyle = "#171717";
    handleCtx.lineWidth = 2;
    handleCtx.strokeStyle = "#FFFFFF";
    handleCtx.beginPath();
    handleCtx.arc(10,10,9,0,2*Math.PI);
    handleCtx.fill();
    handleCtx.stroke();
    //hour hand
    handleCtx.lineWidth = 1;
    handleCtx.beginPath();
    handleCtx.moveTo(10,10);
    let hourHandPos = (parseInt(lastForecast.format("hh"))+currentHourSetting)/12 - 0.25;
    handleCtx.lineTo(10+Math.cos(2*Math.PI*hourHandPos)*5,10+Math.sin(2*Math.PI*hourHandPos)*5);
    handleCtx.stroke();
    //minute hand
    handleCtx.lineWidth = 1;
    handleCtx.beginPath();
    handleCtx.moveTo(10,10);
    handleCtx.lineTo(10,3);
    handleCtx.stroke();

    //popup
    let popup = $('#timePopup');
    popup.text(lastForecast.clone().add(currentHourSetting, 'hours').format("ddd HH:mm [UTC]"));
    popup.css({
        'left':Math.max(Math.min(sliderHandleCanvas.offsetLeft+10+timeSlider.offsetLeft,timeSlideContainer.clientWidth-50),50)
    })
}

function getPixelFromMapPoint(latLng) {
    let topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    let bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    let scale = Math.pow(2, map.getZoom());
    let worldPoint = map.getProjection().fromLatLngToPoint(latLng);
    let point = new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
    return point;
}

function setParticleFile(layer) {
    if (!layer["visualizerPoints"]) {
        layer["visualizerPoints"] = [];
    }
    if (!layer["visualizerGrid"]) {
        layer["visualizerGrid"] = {
            "latStart": 0,
            "latIncrement": 1,
            "lngStart": 0,
            "lngIncrement": 1
        };
    }
    let settingBoundary = false;
    if (!layer["visualizerBoundaryGrid"]) {
        layer["visualizerBoundaryGrid"] = [];
        settingBoundary = true;
    }
    let timeToSet = currentHourSetting;
    $.get(layer["particleUrl"].replace("{_CURRENT_GMU_}",currentGMUDirectory).replace("{_h_}", (currentHourSetting+1).toString()), function (particleData) {
        if (currentHourSetting !== timeToSet)
            return;
        layer["visualizerGrid"]["latStart"] = particleData.lat[0][0];
        layer["visualizerGrid"]["latIncrement"] = particleData.lat[1][0] - particleData.lat[0][0];
        layer["visualizerGrid"]["lngStart"] = particleData.lon[0][0];
        layer["visualizerGrid"]["lngIncrement"] = particleData.lon[0][1] - particleData.lon[0][0];
        for (let i = 0; i < particleData.lat.length; i++) {
            for (let j = 0; j < particleData.lat[i].length; j++) {
                let latNum = Math.round((particleData.lat[i][j] - layer["visualizerGrid"]["latStart"]) / layer["visualizerGrid"]["latIncrement"]);
                let lngNum = Math.abs(Math.round((particleData.lon[i][j] - layer["visualizerGrid"]["lngStart"]) / layer["visualizerGrid"]["lngIncrement"]));
                if (typeof layer["visualizerPoints"][latNum] === 'undefined')
                    layer["visualizerPoints"][latNum] = [];
                layer["visualizerPoints"][latNum][lngNum] = {
                    lat: particleData.lat[i][j],
                    lng: particleData.lon[i][j],
                    vLat: particleData[layer["particleLat"]][i][j],
                    vLng: particleData[layer["particleLng"]][i][j]
                };
                if (settingBoundary) {
                    if (typeof layer["visualizerBoundaryGrid"][latNum] === 'undefined')
                        layer["visualizerBoundaryGrid"][latNum] = [];
                    layer["visualizerBoundaryGrid"][latNum][lngNum] = google.maps.geometry.poly.containsLocation(new google.maps.LatLng(particleData.lat[i][j], particleData.lon[i][j]), particleBoundary);
                }
            }
        }
    });
}

let overCtx = mapOverlayCanvas.getContext('2d');
window.addEventListener('resize',function() {
    mapOverlayCanvas.width = mapOverlayCanvas.clientWidth;
    mapOverlayCanvas.height = mapOverlayCanvas.clientHeight;
});
mapOverlayCanvas.width = mapOverlayCanvas.clientWidth;
mapOverlayCanvas.height = mapOverlayCanvas.clientHeight;
function showParticles(layer) {
    layer["particlesRunning"] = true;
    layer["visParticles"] = [];
    setParticleFile(layer);
    overCtx.fillStyle = "rgba(255,255,255,0.06)";
    overCtx.fillRect(0,0,mapOverlayCanvas.width,mapOverlayCanvas.height);
}

function hideParticles(layer) {
    layer["particlesRunning"] = false;
    overCtx.clearRect(0,0,mapOverlayCanvas.width,mapOverlayCanvas.height);
    overCtx.fillStyle = "rgba(255,255,255,0.06)";
    overCtx.fillRect(0,0,mapOverlayCanvas.width,mapOverlayCanvas.height);
}

let lastFrameTime;
function drawOverlay(currentTime) {
    let frameLength;
    if (lastFrameTime)
        frameLength = (currentTime - lastFrameTime) / 1000;
    else
        frameLength = 0;
    //if frame is crazy long we'll just ignore it
    if (frameLength > 0.1)
        frameLength = 0;
    lastFrameTime = currentTime;
    
    //fade trails
    overCtx.globalCompositeOperation = "destination-out";
    overCtx.globalAlpha = 0.04;
    overCtx.fillStyle = "#000000";
    overCtx.fillRect(0, 0, mapOverlayCanvas.width, mapOverlayCanvas.height);
    overCtx.globalCompositeOperation = "source-over";
    let topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    let bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    let scale = Math.pow(2, map.getZoom());
    overCtx.fillStyle = "#ffffff";

    let drewAnything = false;

    for (let layerIndex in layers) {
        if (!layers.hasOwnProperty(layerIndex))
            continue;
        let layer = layers[layerIndex];
        if (!layer["hasParticles"] || !layer["particlesRunning"])
            continue;

        drewAnything = true;

        let visParticles = layer["visParticles"];
        let visualizerPoints = layer["visualizerPoints"];
        let visualizerGrid = layer["visualizerGrid"];
        let visualizerBoundaryGrid = layer["visualizerBoundaryGrid"];

        if (map.getZoom() > 3) {
            for (let i = 0; i < visParticles.length; i++) {
                let point = new google.maps.LatLng(visParticles[i]["lat"], visParticles[i]["lng"]);
                let worldPoint = map.getProjection().fromLatLngToPoint(point);
                let pixel = new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
                if (visParticles[i]["age"] < 1) {
                    overCtx.globalAlpha = visParticles[i]["age"];
                }
                else {
                    overCtx.globalAlpha = 1;
                }
                overCtx.fillRect(pixel.x, pixel.y, 2, 2);
            }
            overCtx.globalAlpha = 1;
            // for (let i = 0; i < visualizerPoints.length; i++) {
            //     if (typeof visualizerPoints[i] !== 'undefined') {
            //         for (let j = 0; j < visualizerPoints[i].length; j++) {
            //             if (typeof visualizerPoints[i][j] !== 'undefined') {
            //                 let point = visualizerPoints[i][j]["point"];
            //                 let worldPoint = map.getProjection().fromLatLngToPoint(point);
            //                 let pixel = new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
            //                 if (visualizerBoundaryGrid[i][j])
            //                     overCtx.fillStyle = "#00FF00";
            //                 else
            //                     overCtx.fillStyle = "#FF0000";
            //                 overCtx.fillRect(pixel.x, pixel.y, 2, 2);
            //             }
            //         }
            //     }
            // }
        }
        //create new particles
        for (let i = 0; i < 5; i++) {
            if (map.getZoom() < 6) {
                visParticles.push({
                    lat: Math.random() * 41 + 6,
                    lng: Math.random() * 38 - 98,
                    vLat: 0,
                    vLng: 0,
                    age: 0
                });
            }
            else {
                visParticles.push({
                    lat: Math.random() * (map.getBounds().getNorthEast().lat() - map.getBounds().getSouthWest().lat()) + map.getBounds().getSouthWest().lat(),
                    lng: Math.random() * (map.getBounds().getNorthEast().lng() - map.getBounds().getSouthWest().lng()) + map.getBounds().getSouthWest().lng(),
                    vLat: 0,
                    vLng: 0,
                    age: 0
                });
            }
            if (visParticles.length > 500)
                visParticles.shift();
        }
        //move
        let moveFactor;
        if (map.getZoom() < 6)
            moveFactor = 1.875;
        else
            moveFactor = 60 / Math.pow(2, map.getZoom());
        for (let i = 0; i < visParticles.length; i++) {
            let lat = Math.round((visParticles[i]["lat"] - visualizerGrid["latStart"]) / visualizerGrid["latIncrement"]);
            let lng = Math.round((visParticles[i]["lng"] - visualizerGrid["lngStart"]) / visualizerGrid["lngIncrement"]);
            let shouldKill = false;
            if (typeof visualizerPoints[lat] !== 'undefined' && typeof visualizerPoints[lat][lng] !== 'undefined' && visualizerPoints[lat][lng] !== null) {
                visParticles[i]["vLat"] += (visualizerPoints[lat][lng]["vLat"] - visParticles[i]["vLat"]) / 5;
                visParticles[i]["vLng"] += (visualizerPoints[lat][lng]["vLng"] - visParticles[i]["vLng"]) / 5;
                if (!visualizerBoundaryGrid[lat][lng]) {
                    shouldKill = true;
                }
            }
            else {
                if (!google.maps.geometry.poly.containsLocation(new google.maps.LatLng(visParticles[i]["lat"], visParticles[i]["lng"]), particleBoundary))
                    shouldKill = true;
            }
            visParticles[i]["lat"] += visParticles[i]["vLat"] * frameLength * moveFactor;
            visParticles[i]["lng"] += visParticles[i]["vLng"] * frameLength * moveFactor;
            visParticles[i]["age"] += frameLength;
            if (Math.abs(visParticles[i]["vLat"]) < 0.002 && Math.abs(visParticles[i]["vLng"]) < 0.002)
                shouldKill = true;
            if (shouldKill) {
                visParticles.splice(i, 1);
                i--;
            }
        }
    }

    if (!drewAnything && mapOverlayCanvas.style.display === "block") {
        mapOverlayCanvas.style.display = "none";
    }
    else if (drewAnything && mapOverlayCanvas.style.display === "none") {
        mapOverlayCanvas.style.display = "block";
    }

    window.requestAnimationFrame(drawOverlay);
}


//plotly
function makePlotStationTimeseries(url, domNode, levels, title) {
    Plotly.d3.tsv(url, function (err, rows) {
        function unpack(rows, key) {
            date_start_plot = rows[0].Time_observed;
            date_stop_plot = rows[rows.length - 1].Time_adcirc;
            date_now_plot = rows[0].Time_adcirc;
            date_now1_plot = rows[2].Time_adcirc;
            return rows.map(function (row) {
                return row[key];
            });
        }

        let iFLood = {
            type: "scatter",
            mode: 'lines+markers',
            name: 'iflood',
            hoverinfo: "y",
            x: unpack(rows, 'Time_adcirc'),
            y: unpack(rows, 'iflood'),
            line: {
                color: '#008000',
                width: 1
            },
            marker: {
                color: '#008000',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        }
        let ETSS = {
            type: "scatter",
            mode: "lines",
            name: 'ETSS',
            hoverinfo: "y",
            x: unpack(rows, 'Time_adcirc'),
            y: unpack(rows, 'etss'),
            line: {
                color: 'rgb(204, 0, 204)',
                width: 1
            },
            marker: {
                color: 'rgb(204, 0, 204)',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        }
        let AHPS = {
            type: "scatter",
            mode: "lines+markers",
            name: 'AHPS',
            hoverinfo: "y",
            x: unpack(rows, 'Time_ahps'),
            y: unpack(rows, 'ahps'),
            line: {
                color: 'red',
                width: 1
            },
            marker: {
                color: 'red',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        }
        let ESTOFS = {
            type: "scatter",
            mode: "lines",
            name: 'ESTOFS',
            hoverinfo: "y",
            x: unpack(rows, 'Time_adcirc'),
            y: unpack(rows, 'estofs'),
            line: {
                color: 'rgb(0, 0, 255)',
                width: 1
            },
            marker: {
                color: 'rgb(0, 0, 255)',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        }
        let CBOFS = {
            type: "scatter",
            mode: "lines",
            name: 'CBOFS',
            hoverinfo: "y",
            x: unpack(rows, 'Time_adcirc'),
            y: unpack(rows, 'cbofs'),
            line: {
                color: 'brown',
                width: 1
            },
            marker: {
                color: 'brown',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        }
        let Observed = {
            type: "scatter",
            mode: "lines+markers",
            name: 'Observed ',
            hoverinfo: "y",
            x: unpack(rows, 'Time_observed'),
            y: unpack(rows, 'observed'),
            line: {
                color: 'blue',
                width: 1
            },
            marker: {
                color: 'blue',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        }
        let data = [iFLood, AHPS, ETSS, ESTOFS, CBOFS, Observed];
        let layout = {
            showlegend: true,
            hovermode: "x",
            "spikedistance": "data",
            "showcrossline": "true",
            title: title,
            legend: {"orientation": "h"},
            //"xanchor": "center"},
            margin: {
                l: 60,
                r: 0,
                t: 40,
                b: 0
            },
            // width: 500,
            // height: 350,
            images: [
                {
                    source: "/MasonM.png",
                    xref: "paper",
                    yref: "paper",
                    x: .87,
                    y: .985,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.75,
                    layer: "above"
                }],
            annotations: [
                {
                    xref: "paper",
                    yref: "y",
                    x: 0,
                    y: levels[0]+0.2,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "center",
                    text: '                     Action: '+levels[0]+' ft',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }
                ,
                {
                    xref: "paper",
                    yref: "y",
                    x: 0,
                    y: levels[1]+0.2,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "center",
                    text: '                     Minor: '+levels[1]+' ft',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }
                ,
                {
                    xref: "paper",
                    yref: "y",
                    x: 0,
                    y: levels[2]+0.2,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "center",
                    text: '                          Moderate: '+levels[2]+' ft',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }
                ,
                {
                    xref: "paper",
                    yref: "y",
                    x: 0,
                    y: levels[3]+0.2,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "center",
                    text: '                     Major: '+levels[3]+' ft',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }

                ,
                {
                    x: date_now1_plot,
                    y: 4,
                    opacity: 0.95,
                    textangle: -90,
                    layer: "above",
                    text: 'Forecast Start',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }
            ],

            shapes: [
                {
                    type: 'line',
                    layer: 'above',
                    x0: date_now_plot,
                    y0: -1,
                    x1: date_now_plot,
                    y1: 8,
                    fillcolor: 'rgb(0,0,0)',
                    opacity: 1.0,
                    line: {
                        width: 1
                    }
                },

                {
                    type: 'rect',
                    layer: 'below',
                    xref: "paper",
                    yref: "y",
                    x0: 0,
                    y0: -1,
                    x1: 1,
                    y1: 2.5,
                    fillcolor: '#ffffff',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                },

                {
                    type: 'rect',
                    layer: 'below',
                    xref: "paper",
                    yref: "y",
                    x0: 0,
                    y0: levels[0],
                    x1: 1,
                    y1: levels[1],
                    fillcolor: '#f9f900',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                },
                {
                    type: 'rect',
                    layer: 'below',
                    xref: "paper",
                    yref: "y",
                    x0: 0,
                    y0: levels[1],
                    x1: 1,
                    y1: levels[2],
                    fillcolor: '#ffa600',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                },
                {
                    type: 'rect',
                    layer: 'below',
                    xref: "paper",
                    yref: "y",
                    x0: 0,
                    y0: levels[2],
                    x1: 1,
                    y1: levels[3],
                    fillcolor: 'rgb(255,0,0)',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                },
                {
                    type: 'rect',
                    layer: 'below',
                    xref: "paper",
                    yref: "y",
                    x0: 0,
                    y0: levels[3],
                    x1: 1,
                    y1: 8,
                    fillcolor: '#7c01a6',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                }],
            xaxis: {
                showgrid: true,
                showspikes: true,
                spikemode: "across",
                gridcolor: 'rgba(153,153,153,0.5)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                anchor: 'y1',
                nticks: 8,
                tickcolor: '#bfbfbf',
                tickwidth: 4,
                mirror: true,
                range: [date_start_plot, date_stop_plot],

            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(153,153,153,0.5)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                tickwidth: .25,
                tick0: 0,
                domain: [0, 1],
                tickwidth: 1,
                nticks: 8,
                mirror: true,
                title: 'Stage (feet relative to MLLW)',
                range: [-1, 8],
            }
        };
        Plotly.newPlot(domNode, data, layout, {displayModeBar: false, responsive: true});
    });
}

function makePlotStationValidation(url, domNode, stationStr, title) {
    Plotly.d3.tsv(url, function (err, rows) {
        function unpack(rows, key) {
            date_start_plot = rows[0].Time_observed;
            date_stop_plot = rows[rows.length - 1].Time_adcirc;
            date_now_plot = rows[0].Time_adcirc;
            date_now1_plot = rows[2].Time_adcirc;

            return rows.map(function (row) {
                return row[key];
            });
        }

        let iFLood = {
            type: "scatter",
            mode: 'lines+markers',
            name: 'iflood',
            hoverinfo: "y",
            x: Array.from(Array(25).keys()).slice(1),
            y: unpack(rows, stationStr+'_iflood'),
            line: {
                color: '#008000',
                width: 1
            },
            marker: {
                color: '#008000',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        };
        let ETSS = {
            type: "scatter",
            mode: 'lines+markers',
            name: 'ETSS',
            hoverinfo: "y",
            x: Array.from(Array(25).keys()).slice(1),
            y: unpack(rows, stationStr+'_etss'),
            line: {
                color: 'rgb(204, 0, 204)',
                width: 1
            },
            marker: {
                color: 'rgb(204, 0, 204)',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        };
        let AHPS = {
            type: "scatter",
            mode: 'lines+markers',
            name: 'AHPS',
            hoverinfo: "y",
            x: Array.from(Array(25).keys()).slice(1),
            y: unpack(rows, stationStr+''),
            line: {
                color: 'red',
                width: 1
            },
            marker: {
                color: 'red',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        };
        let ESTOFS = {
            type: "scatter",
            mode: 'lines+markers',
            name: 'ESTOFS',
            hoverinfo: "y",
            x: Array.from(Array(25).keys()).slice(1),
            y: unpack(rows, stationStr+'_estofs'),
            line: {
                color: 'rgb(0, 0, 255)',
                width: 1
            },
            marker: {
                color: 'rgb(0, 0, 255)',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        };
        let CBOFS = {
            type: "scatter",
            mode: 'lines+markers',
            name: 'CBOFS',
            hoverinfo: "y",
            x: Array.from(Array(25).keys()).slice(1),
            y: unpack(rows, stationStr+'_cbofs'),
            line: {
                color: 'rgb(0, 255, 255)',
                width: 1
            },
            marker: {
                color: 'rgb(0, 255, 255)',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        };
        let Unbiased_ETSS = {
            type: "scatter",
            mode: 'lines+markers',
            name: 'unbiased_ETSS ',
            hoverinfo: "y",
            x: Array.from(Array(25).keys()).slice(1),
            y: unpack(rows, stationStr+'_unbiasedEtss'),
            line: {
                color: 'black',
                width: 1
            },
            marker: {
                color: 'black',
                width: 0.25
            },
            xaxis: 'x1',
            yaxis: 'y1'
        };
        let data = [iFLood, AHPS, ETSS, ESTOFS, CBOFS, Unbiased_ETSS];
        let layout = {
            showlegend: true,
            hovermode: "x",
            "spikedistance": "data",
            "showcrossline": "true",
            title: title,
            legend: {"orientation": "h"},
            margin: {
                l: 60,
                r: 0,
                t: 40,
                b: 0
            },
            // width: 500,
            // height: 350,
            //"xanchor": "center"},
            images: [
                {
                    source: "https://masonfloodhazardsresearchlab.github.io/Xbeach/MasonM.png",
                    xref: "paper",
                    yref: "paper",
                    x: .83,
                    y: .985,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.75,
                    layer: "above"
                }],
            annotations: [
                {
                    xref: "paper",
                    yref: "y",
                    x: 0.25,
                    y: 1.5,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "center",
                    text: '                     Over Prediction',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }
                ,
                {
                    xref: "paper",
                    yref: "y",
                    x: 0.25,
                    y: -1.5,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "center",
                    text: '                     Under Prediction',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }

            ],

            shapes: [
                {
                    type: 'line',
                    layer: 'above',
                    x0: 1,
                    y0: 0,
                    x1: 6,
                    y1: 0,
                    fillcolor: 'rgb(0,0,0)',
                    opacity: 1.0,
                    line: {
                        width: 1
                    }
                },


                {
                    type: 'rect',
                    layer: 'below',
                    xref: "paper",
                    yref: "y",
                    x0: 0,
                    y0: 2,
                    x1: 1,
                    y1: 0,
                    fillcolor: 'red',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                },

                {
                    type: 'rect',
                    layer: 'below',
                    xref: "paper",
                    yref: "y",
                    x0: 0,
                    y0: 0,
                    x1: 1,
                    y1: -2,
                    fillcolor: 'blue',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                }
            ],
            xaxis: {
                showgrid: true,
                showspikes: true,
                spikemode: "across",
                gridcolor: 'rgba(255,255,255,0.3)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                anchor: 'y1',
                nticks: 24,
                tickcolor: '#bfbfbf',
                tickwidth: 4,
                mirror: true,
                range: [1, 24],

            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(255,255,255,0.3)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                tickwidth: .25,
                tick0: 0,
                domain: [0, 1],
                tickwidth: 1,
                nticks: 4,
                mirror: true,
                title: 'BIAS (feet relative to MLLW)',
                range: [-2, 2],
            }
        };
        Plotly.newPlot(domNode, data, layout, {displayModeBar: false, responsive: true});
    });
}