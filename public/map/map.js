//force browser to load preloader image in advance even though it isn't displayed anywhere yet
let preloadTheLoader = new Image();
preloadTheLoader.src = "tail-spin.svg";

let currentGMUDirectory = "";
let currentDownloadDirectory = "";

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

let lastHoverPos = null;

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
    Object.keys(layers).forEach(layerIndex => {
        let layer = layers[layerIndex];
        //create info bar
        let newItem = $(templateLayerInfo.render(layer)).css({
            display: "none"
        }).appendTo(domLayerInfo);
        newItem.find(".dataButton").attr("href",replaceModelPaths(layer["downloadUrl"]));
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
        layer["domTile"] = newTile;
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
                    layer["visible"] = false;
                    updateHash();
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
    });

    Object.keys(markers).forEach(markerIndex => {
        let marker = markers[markerIndex];
        marker["gMarker"] = new google.maps.Marker({
            map: map,
            draggable: false,
            title: marker["title"],
            position: marker["pos"]
        });
        if (marker["type"] === "station") {
            marker["gMarker"].setIcon({
                "url": "/map/sprites/markers/station/unknown.svg",
                "anchor": new google.maps.Point(10, 31),
                "scaledSize": new google.maps.Size(21, 32),
            });
        }
        else if (marker["type"] === "buoy") {
            marker["gMarker"].setIcon({
                "url": "/map/sprites/markers/wave/unknown.svg",
                "anchor": new google.maps.Point(15, 27),
                "scaledSize": new google.maps.Size(30, 28),
            });
        }
        else if (marker["type"] === "iflood") {
            marker["gMarker"].setIcon({
                "url": "/map/sprites/markers/iflood/iflood.svg",
                "anchor": new google.maps.Point(13, 33),
                "scaledSize": new google.maps.Size(26, 34),
            });
        }
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
                Plotly.purge(domPlot[0]);
                $(timeSlideContainer).removeClass("mobileHide");
                drawTimeSlide();
            });
            infoWindow.open(map, marker["gMarker"]);
            $(timeSlideContainer).addClass("mobileHide");
            if (typeof marker["notice"] === 'undefined') {
                $(templatePopupTabs.render(marker)).appendTo(domPlot);
                if (marker["hasWater"]) {
                    makePlotStationWater(replaceModelPaths(stationWaterUrl).replace("{_s_}", marker["stationStr"]), domPlot.find("#mapPopupContentWater")[0], marker["title"] + ": Water Level", marker);
                }
                if (marker["hasValidationFile"] || marker["hasRealtimeValidation"]) {
                    if (marker["hasValidationFile"])
                        makePlotStationValidation(replaceModelPaths(stationValidationUrl).replace("{_s_}",marker["stationStr"]), domPlot.find("#mapPopupContentValidation")[0], marker["title"] + ": Water Validation");
                    if (marker["hasRealtimeValidation"])
                        makePlotStationRealtimeValidation(replaceModelPaths(stationWaterUrl).replace("{_s_}",marker["stationStr"]), domPlot.find("#mapPopupContentRealtimeValidation")[0], marker["title"] + ": Water Realtime Validation", marker);
                    if (marker["hasValidationFile"] && marker["hasRealtimeValidation"]) {
                        domPlot.find("#popupValidationSwitcher .realtimeButton").click(function() {
                            domPlot.find("#mapPopupContentRealtimeValidation").css({"display": "block"});
                            domPlot.find("#mapPopupContentValidation").css({"display": "none"});
                            $(this).addClass("selected");
                            domPlot.find("#popupValidationSwitcher .dailyButton").removeClass("selected");
                        });
                        domPlot.find("#popupValidationSwitcher .dailyButton").click(function() {
                            domPlot.find("#mapPopupContentRealtimeValidation").css({"display": "none"});
                            domPlot.find("#mapPopupContentValidation").css({"display": "block"});
                            $(this).addClass("selected");
                            domPlot.find("#popupValidationSwitcher .realtimeButton").removeClass("selected");
                        });
                    }
                }
                if (marker["hasWind"]) {
                    domPlot.find("#mapPopupContentWind").append($('<img>',{
                        "class":"plotImg",
                        "src":models["ChesapeakeBay_ADCIRCSWAN"]["currentDirectory"]+"/TimeSeries/Wind/"+marker["stationStr"]+".png",
                    }));
                }
                if (marker["hasWaves"]) {
                    makePlotStationWaves(replaceModelPaths(stationWavesUrl).replace("{_s_}",marker["stationStr"]), domPlot.find("#mapPopupContentWaves")[0], marker["title"] + ": Significant Wave Height");
                }
                if (marker["hasWavesValidation"]) {
                    makePlotStationWavesValidation(replaceModelPaths(stationWavesValidationUrl).replace("{_s_}",marker["stationStr"]), domPlot.find("#mapPopupContentWavesValidation")[0], marker["title"] + ": Wave Validation");
                }
                if (marker["hasXbeachVideo"]) {
                    domPlot.find("#mapPopupContentXbeachVideo").append(
                        $('<video>', {
                            'class':'popupVideo',
                            'autoplay':'',
                            'loop':'',
                            'muted':''
                        }).append($('<source>', {
                            'type':'video/mp4',
                            'src':replaceModelPaths(marker["xbeachVideoUrl"])
                        }))
                    );
                }
                if (marker["hasCamera"]) {
                    domPlot.find("#mapPopupContentCamera").append(
                        $('<iframe>', {
                            'src': '/webcam#'+marker["cameraStreamId"],
                            'class': 'cameraEmbedFrame'
                        })
                    );
                    domPlot.find("#mapPopupContentCamera").click(function() {
                        window.open('/webcam#'+marker["cameraStreamId"], '_blank');
                    });
                }
                domPlot.find(".mapPopupContent").first().css({"display": "block"});
                domPlot.find(".tab").first().addClass("current");
                function hideAll() {
                    domPlot.find(".mapPopupContent").css({"display": "none"});
                    domPlot.find(".tab").removeClass("current");
                    domPlot.find("#popupValidationSwitcher").css({"display": "none"});
                    domPlot.find("#popupValidationSwitcher .realtimeButton").addClass("selected");
                    domPlot.find("#popupValidationSwitcher .dailyButton").removeClass("selected");
                }
                domPlot.find("#mapPopupTabWater").click(function() {
                    hideAll();
                    domPlot.find("#mapPopupContentWater").css({"display": "block"});
                    $(this).addClass("current");
                    window.dispatchEvent(new Event('resize')); //plotly doesn't always realize it needs to resize
                });
                domPlot.find("#mapPopupTabWind").click(function() {
                    hideAll();
                    domPlot.find("#mapPopupContentWind").css({"display": "block"});
                    $(this).addClass("current");
                    window.dispatchEvent(new Event('resize'));
                });
                domPlot.find("#mapPopupTabWaves").click(function() {
                    hideAll();
                    domPlot.find("#mapPopupContentWaves").css({"display": "block"});
                    $(this).addClass("current");
                    window.dispatchEvent(new Event('resize'));
                });
                domPlot.find("#mapPopupTabValidation").click(function() {
                    hideAll();
                    if (domPlot.find("#mapPopupContentRealtimeValidation").length)
                        domPlot.find("#mapPopupContentRealtimeValidation").css({"display": "block"});
                    else
                        domPlot.find("#mapPopupContentValidation").css({"display": "block"});
                    if (marker["hasValidationFile"] && marker["hasRealtimeValidation"])
                        domPlot.find("#popupValidationSwitcher").css({"display": "flex"});
                    $(this).addClass("current");
                    window.dispatchEvent(new Event('resize'));
                });
                domPlot.find("#mapPopupTabWavesValidation").click(function() {
                    hideAll();
                    domPlot.find("#mapPopupContentWavesValidation").css({"display": "block"});
                    $(this).addClass("current");
                    window.dispatchEvent(new Event('resize'));
                });
                domPlot.find("#mapPopupTabXbeachVideo").click(function() {
                    hideAll();
                    domPlot.find("#mapPopupContentXbeachVideo").css({"display": "block"});
                    domPlot.find("#mapPopupContentXbeachVideo video")[0].play();
                    $(this).addClass("current");
                    window.dispatchEvent(new Event('resize'));
                });
                domPlot.find("#mapPopupTabCamera").click(function() {
                    hideAll();
                    domPlot.find("#mapPopupContentCamera").css({"display": "block"});
                    $(this).addClass("current");
                    window.dispatchEvent(new Event('resize'));
                });

                setTimeout(function() {window.dispatchEvent(new Event('resize'));}, 50);
            }
            else {
                domPlot[0].innerHTML = marker["notice"];
            }
        });
    });
    //set icons based on files
    $.get(models["ChesapeakeBay_ADCIRCSWAN"]["currentDirectory"]+"/GeoJson/Floodlevels.json",function(markerLevels) {
        Object.keys(markers).forEach(markerIndex => {
            let marker = markers[markerIndex];
            if (marker["type"] === "station") {
                if (markerLevels.hasOwnProperty(marker["stationStr"])) {
                    let iconUrl;
                    switch (markerLevels[marker["stationStr"]]["Flood Level"]) {
                        case "Action":
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/station/action.svg",
                                "anchor": new google.maps.Point(17.5, 44),
                                "scaledSize": new google.maps.Size(35, 45),
                            });
                            break;
                        case "Minor":
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/station/minor.svg",
                                "anchor": new google.maps.Point(17.5, 44),
                                "scaledSize": new google.maps.Size(35, 45),
                            });
                            break;
                        case "Moderate":
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/station/moderate.svg",
                                "anchor": new google.maps.Point(22.5, 49),
                                "scaledSize": new google.maps.Size(45, 50),
                            });
                            break;
                        case "Major":
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/station/major.svg",
                                "anchor": new google.maps.Point(22.5, 49),
                                "scaledSize": new google.maps.Size(45, 50),
                            });
                            break;
                        default:
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/station/default.svg",
                                "anchor": new google.maps.Point(10, 31),
                                "scaledSize": new google.maps.Size(21, 32),
                            });
                            break;
                    }
                }
            }
        });
    });
    $.get(models["ChesapeakeBay_ADCIRCSWAN"]["currentDirectory"]+"/GeoJson/wavelevels.json",function(markerLevels) {
        Object.keys(markers).forEach(markerIndex => {
            let marker = markers[markerIndex];
            if (marker["type"] === "buoy") {
                if (markerLevels.hasOwnProperty(marker["stationStr"])) {
                    let iconUrl;
                    switch (markerLevels[marker["stationStr"]]["Flood Level"]) {
                        case "Major_swell":
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/wave/major.svg",
                                "anchor": new google.maps.Point(15, 27),
                                "scaledSize": new google.maps.Size(30, 28),
                            });
                            break;
                        case "Action":
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/wave/moderate.svg",
                                "anchor": new google.maps.Point(15, 27),
                                "scaledSize": new google.maps.Size(30, 28),
                            });
                            break;
                        default:
                            marker["gMarker"].setIcon({
                                "url": "/map/sprites/markers/wave/calm.svg",
                                "anchor": new google.maps.Point(15, 27),
                                "scaledSize": new google.maps.Size(30, 28),
                            });
                            break;
                    }
                }
            }
        });
    });

    Object.keys(places).forEach(placeIndex => {
        let place = places[placeIndex];
        let newButton = $(templatePlaceButton.render(place)).appendTo(domPlaceButtons);
        newButton.click(function() {
            map.panTo(place["pos"]);
            map.setZoom(place["zoom"]);
        });
    });

    let zoomTimeout; //wait for the user to stop zooming before updating layers, since it sometimes freezes the main thread
    google.maps.event.addListener(map, 'bounds_changed', function() {
        clearTimeout(zoomTimeout);
        zoomTimeout = setTimeout(updateView, 400);
    });

    map.addListener('click', function() {
        if (currentInfoWindow) {
            currentInfoWindow.close();
            Plotly.purge(currentInfoWindow.content);
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
    $.get(dataDomain + "/Model/boundary/ModelBoundaryPoly.json", function (boundaryData) {
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

    //read hash
    if (window.location.hash) {
        let hashText = window.location.hash.replace("#","");
        let hashLayers = hashText.split(",");
        for (let i = 0; i < hashLayers.length; i++) {
            if (layers.hasOwnProperty(hashLayers[i]))
                layers[hashLayers[i]]["domTile"].click();
        }
    }
}
//---   initial loading of models   ---
$('#mapContainer').removeClass("loading");
showMessageBox("welcomeMessageBox");
let modelLoadingPromises = [];
for (let modelName in models) {
    if (!models.hasOwnProperty(modelName))
        continue;
    let model = models[modelName];
    modelLoadingPromises.push(
        $.get(dataDomain+"/Forecast/"+modelName+"/recent.txt?v="+Math.round(Math.random()*100000000).toString(), function(recentRun) {
            model["lastForecast"] = moment.utc(recentRun, "YYYYMMDDHH");
            model["currentDirectory"] = dataDomain+"/Forecast/"+modelName+"/"+recentRun;
            model["currentDownloadDirectory"] = dataDomain+"/?prefix=Forecast/"+modelName+"/"+recentRun;
        })
    );
}
$.when.apply($, modelLoadingPromises).then(function() {
    thisHour = Math.min(moment().diff(models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"], 'H'), 83);
    //check time every minute so timeline updates when the hour ticks over
    setInterval(function() {
        thisHour = Math.min(moment().diff(models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"], 'H'), 83);
        drawTimeSlide();
    }, 60000);
    //also check the model data age every hour and remind user to refresh if they're viewing stale data
    setInterval(function() {
        Object.keys(models).forEach(modelName => {
            let model = models[modelName];
            modelLoadingPromises.push(
                $.get(dataDomain+"/Forecast/"+modelName+"/recent.txt?v="+Math.round(Math.random()*100000000).toString(), function(recentRun) {
                    if (!model["lastForecast"].isSame(moment.utc(recentRun, "YYYYMMDDHH"))) {
                        $('#mapContainer').addClass("historical");
                        $('#modelInfo')
                            .addClass("historical")
                            .text("Viewing iFlood data generated "+models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"].format("HH:mm [UTC,] YYYY-MM-DD")+". Refresh to view latest forecast.");
                    }
                })
            );
        });
    }, 60000*60);
    currentHourSetting = thisHour;
    //currentGMUDirectory = dataDomain+"/Forecast/ChesapeakeBay_ADCIRCSWAN/"+recentRun;
    //currentDownloadDirectory = dataDomain+"/?prefix=Forecast/ChesapeakeBay_ADCIRCSWAN/"+recentRun;
    $('#modelInfo').text("iFlood data generated "+models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"].format("HH:mm [UTC,] YYYY-MM-DD")+". Third party data may be older.");
    drawTimeSlide();
    init();
});

function replaceModelPaths(inStr) {
    let outStr = inStr;
    for (let modelName in models) {
        if (!models.hasOwnProperty(modelName))
            continue;
        let model = models[modelName];
        outStr = outStr.replace("{_"+modelName+"_FILES_}",model["currentDirectory"]);
        outStr = outStr.replace("{_"+modelName+"_DOWNLOAD_}",model["currentDownloadDirectory"]);
    }
    return outStr;
}

//---   interface   ---
//expand button for mobile
$('#expandButton').click(function() {
    domLayerBar.toggleClass('expanded');
});

//marker toggles
["station","buoy","iflood"].forEach(type => {
    $('#'+type+'MarkerToggle').click(function() {
        if ($(this).hasClass('showing')) {
            $(this).removeClass('showing');
            Object.values(markers).forEach(marker => {
                if (marker["type"] === type)
                    marker["gMarker"].setMap(null);
            });
        }
        else {
            $(this).addClass('showing');
            Object.values(markers).forEach(marker => {
                if (marker["type"] === type)
                    marker["gMarker"].setMap(map);
            });
        }
    });
});

//time slider
let sliderGrabbed = false;
let sliderMouseIn = false;
let sliderTimeout = null;
function sliderShowHidePopup() {
    if ((sliderGrabbed || sliderMouseIn) && !currentlyMax)
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
    if (currentlyMax)
        hideMax();
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

//max button
let maxButton = $('#maxButton');
let currentlyMax = false;
let originalHourSetting = 0;

function showMax() {
    if (animationPlaying)
        stopAnim();
    maxButton.addClass("active");
    originalHourSetting = currentHourSetting;
    currentHourSetting = -1;
    currentlyMax = true;
}
function hideMax() {
    maxButton.removeClass("active");
    currentHourSetting = originalHourSetting;
    currentlyMax = false;
}

maxButton.click(function() {
    if (currentlyMax)
        hideMax();
    else
        showMax();
    drawTimeSlide();
    updateTime()
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

function startAnim() {
    if (currentlyMax)
        hideMax();
    animationPlaying = true;
    playButton.removeClass("play");
    playButton.addClass("pause");
    animationTimeout = stepTime();
}
function stopAnim() {
    animationPlaying = false;
    playButton.removeClass("pause");
    playButton.addClass("play");
    clearTimeout(animationTimeout);
}
playButton.click(function() {
    if (animationPlaying)
        stopAnim();
    else
        startAnim();
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
            if (layer["storms"][stormID][i]["time"].isAfter(models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"].clone().add(currentHourSetting, 'hours')))
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

//set the URL hash to include all currently enabled layers
function updateHash() {
    let hashStr = "";
    Object.keys(layers).forEach(layerName => {
        if (layers[layerName]["visible"])
            hashStr += layerName + ","
    });
    history.replaceState(undefined, undefined, "#"+hashStr.slice(0,-1)); //cut off extra comma
}

//show a layer
function showLayer(layer, oncomplete) {
    layer["visible"] = true;
    updateHash();
    if (layer["type"] === "geoJSON") {
        let index = getViewDataIndex(layer);
        showData(layer, index, currentHourSetting, oncomplete);
    }
    else if (layer["type"] === "outline") {
        if (!layer["data"]) {
            let fileUrl = replaceModelPaths(layer["url"]);
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
            let pointUrl = replaceModelPaths(layer["pointUrl"]);
			let pathUrl = replaceModelPaths(layer["pathUrl"]);
			let polygonUrl = replaceModelPaths(layer["polygonUrl"]);
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
        let fileUrl;
        if (layer["temporal"]) {
            if (timeIndex === -1) {
                if (Array.isArray(layer["maxUrl"]))
                    fileUrl = replaceModelPaths(layer["maxUrl"][dataIndex][1]);
                else
                    fileUrl = replaceModelPaths(layer["maxUrl"]);
            }
            else {
                fileUrl = replaceModelPaths(layer["urls"][dataIndex][1]).replace("{_h_}", (timeIndex + 1).toString());
            }
        }
        else {
            fileUrl = replaceModelPaths(layer["urls"][dataIndex][1]);
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
                if (layer["opacity"] === 1) {
                    return {
                        fillColor: color,
                        fillOpacity: 1,
                        strokeColor: color,
                        strokeWeight: 1,
                        zIndex: layer["z"],
                    };
                }
                else {
                    return {
                        fillColor: color,
                        fillOpacity: layer["opacity"],
                        strokeWeight: 0,
                        zIndex: layer["z"],
                    };
                }
            });
            google.maps.event.addListener(theDataLayer, 'mouseover', function(event) {
                drawScaleBar(layer,event.feature.getProperty(layer["colorProperty"]));
            });
            //show this data only if it's still the correct one
            if (JSON.stringify(planningToShow) === JSON.stringify(layer["showing"]) && layer["visible"]) {
                setTimeout(function() { //this has to be in a timeout so google maps gets a chance to breathe, otherwise the colors are wrong for a frame or two
                    theDataLayer.setMap(map);
                    if (layer["temporal"])
                        hideAllData(layer, [dataIndex, timeIndex]);
                    else
                        hideAllData(layer, dataIndex);
                }, 0);
            }
            if (oncomplete) {
                oncomplete(true);
            }
        }).fail(function() {
			delete activeDataRequests[fileUrl];
			if (JSON.stringify(planningToShow) === JSON.stringify(layer["showing"]) && layer["visible"]) {
                hideAllData(layer);
            }
			$('#layerErrorBox').addClass('show');
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

//hide data from a specific layer on the map
function hideLayer(layer) {
    layer["visible"] = false;
    updateHash();
    if (layer["type"] === "geoJSON") {
        hideAllData(layer);
        if (layer["temporal"]) {
            for (let i = 0; i < 84; i++) {
                if (layer["data"][layer["showing"][0]][i]) {
                    layer["data"][layer["showing"][0]][i] = null; //the actual geoJSON data takes up a lot of space so allow it to be garbage collected
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

//for geoJSON layers, hide all data contained within (this function is called by hideLayer())
function hideAllData(layer, except) {
    if (layer["temporal"]) {
        for (let i = 0; i < layer["data"].length; i++) {
            if (layer["data"][i]) {
                for (let j = -1; j < layer["data"][i].length; j++) {
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

//given a layer and a view level, get the index of the best url to use for that layer at that view level
function getViewDataIndex(layer) {
    let bounds = map.getBounds();
    let ne = bounds.getNorthEast();
    let sw = bounds.getSouthWest();

    let currentView = 0;
    for (let i = 0; i < layer["urls"].length; i++) { //starts at 1 because 0 has no bounds (it's the default)
        let level = layer["urls"][i][0];
        if (level !== 0) {
            if (sw.lng() > viewLevels[level][0][0] && ne.lat() < viewLevels[level][0][1] && ne.lng() < viewLevels[level][1][0] && sw.lat() > viewLevels[level][1][1])
                currentView = i;
        }
    }
    return currentView;
}

//update layers to show more detailed data for a specific area (if they have it)
function updateView() {
    for (let layerIndex in layers) {
        let layer = layers[layerIndex];
        if (layer["visible"] && layer["type"] === "geoJSON") {
            let index = getViewDataIndex(layer);
            if ((layer["temporal"] && layer["showing"][0] !== index) || (!layer["temporal"] && layer["showing"] !== index)) {
                showData(layer, index, currentHourSetting);
            }
        }
    }
}

//update layers and plots to show data for the currently selected time
function updateTime() {
    //update plotly if needed
    if (currentInfoWindow) {
        $('#mapPopupContentWater, #mapPopupContentWaves').each(function() {
            Plotly.relayout(this, {
                'shapes[0]': null
            });
            Plotly.relayout(this, {
                'shapes[0]': {
                    type: 'line',
                    layer: 'above',
                    x0: getRealSelectedTimeString(),
                    y0: 0,
                    x1: getRealSelectedTimeString(),
                    y1: 1,
                    yref: "paper",
                    opacity: 0.5,
                    line: {
                        color: 'rgb(32,81,124)',
                        width: 2
                    }
                }
            });
        })
    }
    //update data layers
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

//draw the scale bar that shows the color mapping for a layer
function drawScaleBar(layer, current) {
    layer["scaleCanvas"].width = 60*window.devicePixelRatio;
    layer["scaleCanvas"].height = 200*window.devicePixelRatio;

    let context = layer["scaleCanvasContext"];

    context.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    context.clearRect(0,0,60,200);
    context.fillStyle = "rgba(255,255,255,0.6)";
    context.fillRect(0, 0, 60, 200);
    if (layer["reverseBar"]) {
        for (let i = 0; i < 185; i++) {
            context.fillStyle = getColorPoint(layer["colorRange"], 1-(i/185));
            if (i === 184)
                context.fillRect(0, i, 20, 1);
            else
                context.fillRect(0, i, 20, 2);
        }
    }
    else {
        for (let i = 0; i < 185; i++) {
            context.fillStyle = getColorPoint(layer["colorRange"], i/185);
            if (i === 184)
                context.fillRect(0, i, 20, 1);
            else
                context.fillRect(0, i, 20, 2);
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
    context.font = "12px Mukta";
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
        context.font = "bold 12px Mukta";
        context.fillText(current.toString(), 22, Math.floor(Math.min(Math.max(currentAdjusted, 0.03), 0.96) * 185)+5);
    }

    context.fillStyle = "rgba(255,255,255,0.6)";
    context.fillRect(0, 185, 60, 15);
    context.fillStyle = "#000000";
    context.font = "14px Mukta";
    context.textAlign = "center";
    context.fillText(layer["unit"].toString(),30,196);
}

//draw the time slider at the bottom of the screen
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
    if (currentlyMax)
        bgCtx.fillStyle = "#777777";
    else
        bgCtx.fillStyle = "#FFFFFF";
    //sides
    bgCtx.fillRect(gridWidth*2-1,12,2,10);
    bgCtx.fillRect(gridWidth*85-1,12,2,10);
    //current hour
    bgCtx.fillRect(gridWidth*(2+thisHour)-1,12,2,10);
    //top
    bgCtx.fillRect(gridWidth*2-1,12,gridWidth*83+1,2);
    if (!currentlyMax) {
        //text
        bgCtx.font = "12px Mukta";
        bgCtx.textAlign = "center";
        bgCtx.fillStyle = "#FFFFFF";
        let timeString;
        if (currentHourSetting - thisHour > 0)
            timeString = "+" + (currentHourSetting - thisHour).toString() + " hr";
        else if (currentHourSetting - thisHour < 0)
            timeString = currentHourSetting - thisHour + " hr";
        else
            timeString = "now";
        bgCtx.fillText(
            timeString,
            Math.max(20, Math.min(timeSlider.clientWidth - 20, gridWidth * (2 + currentHourSetting) - 1)),
            35
        );

        sliderHandleCanvas.style.left = (gridWidth * (2 + currentHourSetting)) - 10 + "px";
        handleCtx.fillStyle = "#171717";
        handleCtx.lineWidth = 2;
        handleCtx.strokeStyle = "#FFFFFF";
        handleCtx.beginPath();
        handleCtx.arc(10, 10, 9, 0, 2 * Math.PI);
        handleCtx.fill();
        handleCtx.stroke();
        //hour hand
        handleCtx.lineWidth = 1;
        handleCtx.beginPath();
        handleCtx.moveTo(10, 10);
        let hourHandPos = (parseInt(models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"].format("hh")) + currentHourSetting) / 12 - 0.25;
        handleCtx.lineTo(10 + Math.cos(2 * Math.PI * hourHandPos) * 5, 10 + Math.sin(2 * Math.PI * hourHandPos) * 5);
        handleCtx.stroke();
        //minute hand
        handleCtx.lineWidth = 1;
        handleCtx.beginPath();
        handleCtx.moveTo(10, 10);
        handleCtx.lineTo(10, 3);
        handleCtx.stroke();
    }

    //popup
    let popup = $('#timePopup');
    popup.text(models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"].clone().add(currentHourSetting, 'hours').format("ddd HH:mm [UTC]"));
    popup.css({
        'left':Math.max(Math.min(sliderHandleCanvas.offsetLeft+10+timeSlider.offsetLeft,timeSlideContainer.clientWidth-50),50)
    })
}

//produce a YYYY-MM-DD HH:MM:SS string for plotly, based on the current time on the slider
function getRealSelectedTimeString() {
    return models["ChesapeakeBay_ADCIRCSWAN"]["lastForecast"].clone().add(currentHourSetting, "hours").format("YYYY-MM-DD HH:MM:SS")
}

function setParticleFile(layer) {
    if (currentHourSetting === -1)
        return;
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
    $.get(replaceModelPaths(layer["particleUrl"]).replace("{_h_}", (currentHourSetting+1).toString()), function (particleData) {
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
                    vLat: particleData[layer["particleLat"]][i][j]*layer["particleSpeedScale"],
                    vLng: particleData[layer["particleLng"]][i][j]*layer["particleSpeedScale"]
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

//particles
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

    //make sure canvas has been sized
    if (mapOverlayCanvas.width === 0) {
        mapOverlayCanvas.width = mapOverlayCanvas.clientWidth;
        mapOverlayCanvas.height = mapOverlayCanvas.clientHeight;
        overCtx.fillStyle = "rgba(255,255,255,0.06)";
        overCtx.fillRect(0,0,mapOverlayCanvas.width,mapOverlayCanvas.height);
    }

    //fade trails
    overCtx.globalCompositeOperation = "destination-out";
    overCtx.globalAlpha = 0.04;
    overCtx.fillStyle = "#000000";
    overCtx.fillRect(0, 0, mapOverlayCanvas.width, mapOverlayCanvas.height);
    overCtx.globalCompositeOperation = "source-over";
    let topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
    let bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
    let scale = Math.pow(2, map.getZoom());

    let drewAnything = false;

    if (!currentlyMax) { //don't draw anything while viewing max
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
                overCtx.fillStyle = layer["particleColor"];
                for (let i = 0; i < visParticles.length; i++) {
                    let point = new google.maps.LatLng(visParticles[i]["lat"], visParticles[i]["lng"]);
                    let worldPoint = map.getProjection().fromLatLngToPoint(point);
                    let pixel = new google.maps.Point((worldPoint.x - bottomLeft.x) * scale, (worldPoint.y - topRight.y) * scale);
                    let alpha = Math.min(0.95,((visParticles[i]["vLat"]*visParticles[i]["vLat"])+(visParticles[i]["vLng"]*visParticles[i]["vLng"]))/16)+0.05; //set the alpha based on the speed
                    if (visParticles[i]["age"] < 1) {
                        alpha *= visParticles[i]["age"];
                    }
                    if (visParticles[i].hasOwnProperty("death")) {
                        alpha *= visParticles[i]["death"];
                    }
                    overCtx.globalAlpha = alpha;
                    overCtx.fillRect(pixel.x, pixel.y, 2, 2);
                }
                overCtx.globalAlpha = 1;
            }
            //create new particles
            for (let i = 0; i < 10; i++) {
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
            }
            if (visParticles.length > 900) {
                let firstDeadIndex = 0;
                while (visParticles[firstDeadIndex].hasOwnProperty("death"))
                    firstDeadIndex++;
                for (let j = 0; j < visParticles.length-1000-firstDeadIndex; j++)
                    visParticles[firstDeadIndex+j]["death"] = 1;
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
                    visParticles[i]["vLat"] += (visualizerPoints[lat][lng]["vLat"] - visParticles[i]["vLat"]) / 15;
                    visParticles[i]["vLng"] += (visualizerPoints[lat][lng]["vLng"] - visParticles[i]["vLng"]) / 15;
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
                if (visParticles[i].hasOwnProperty("death")) {
                    visParticles[i]["death"] -= frameLength;
                    if (visParticles[i]["death"] <= 0)
                        shouldKill = true;
                }
                if (shouldKill) {
                    visParticles.splice(i, 1);
                    i--;
                }
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
function makePlotStationWater(url, domNode, title, marker) {
    let levels = marker["floodLevels"];
    let iot = marker["iotId"];
    let noaaId = marker["noaaId"];
    let navdOffset = marker["navdOffset"];
    Plotly.d3.tsv(url, function (err, rows) {
        let date_now_plot;
        function unpack(rows, key) {
            date_now_plot = rows[0]["iflood_date"];
            return rows.map(function (row) {
                return row[key];
            });
        }
        let datasets = {
            //label:[time column, data column, color, markers]
            "iFLOOD":["iflood_date","iflood","#008000", true],
            "ETSS":["Time_etss","etss","rgb(204, 0, 204)", false],
            "AHPS":["Time_ahps","ahps","red", true],
            "ESTOFS":["iflood_date","estofs","#00bc7d", false],
            "CBOFS":["iflood_date","cbofs","brown", false],
            "Ensemble":["Time_ensemble","ensemble","orange", false],
        };
        let data = [];
        Object.keys(datasets).forEach(label => {
            if (!rows[0].hasOwnProperty(datasets[label][1]))
                return;
            data.push({
                type: "scatter",
                mode: datasets[label][3] ? 'lines+markers' : 'lines',
                name: label,
                hoverinfo: "y",
                x: unpack(rows, datasets[label][0]),
                y: unpack(rows, datasets[label][1]),
                line: {
                    color: datasets[label][2],
                    width: 1
                },
                marker: {
                    color: datasets[label][2],
                    width: 0.25
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        });
        if (rows[0].hasOwnProperty("observed") && marker["agency"] !== "NOAA") { // only show observed from csv if we don't have something fresher to pull)
            data.push({
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
            });
        }
        if (rows[0].hasOwnProperty("ensemble_upper")) {
            data.push({
                type: "scatter",
                mode: "lines",
                name: '95% CI',
                hoverinfo: "y",
                x: unpack(rows, 'Time_95%'),
                y: unpack(rows, 'ensemble_upper'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                marker: {
                    color: 'blue',
                    width: 0.25
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
            data.push({
                type: "scatter",
                mode: "lines",
                name: '95% CI',
                hoverinfo: "y",
                x: unpack(rows, 'Time_95%'),
                y: unpack(rows, 'ensemble_lower'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                marker: {
                    color: 'blue',
                    width: 0.25
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        let layout = {
            showlegend: true,
            hovermode: "x",
            "spikedistance": "data",
            "showcrossline": "true",
            title: title,
            legend: {
                orientation: "h",
                yanchor: "bottom",
                y: -0.35,
                font: {
                    size: 10
                }
            },
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
                    opacity: 0.25,
                    layer: "above"
                }],
            annotations: [
                {
                    x: date_now_plot,
                    xshift: 7,
                    y: 0.2,
                    yref: "paper",
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
                    x0: getRealSelectedTimeString(),
                    y0: 0,
                    x1: getRealSelectedTimeString(),
                    y1: 1,
                    yref: "paper",
                    opacity: 0.5,
                    line: {
                        color: 'rgb(32,81,124)',
                        width: 2
                    }
                },
                {
                    type: 'line',
                    layer: 'above',
                    x0: date_now_plot,
                    y0: 0,
                    x1: date_now_plot,
                    y1: 1,
                    yref: "paper",
                    opacity: 1.0,
                    line: {
                        color: 'rgb(0,0,0)',
                        width: 1
                    }
                }
            ],
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
                autorange: true,

            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(153,153,153,0.5)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                tick0: 0,
                domain: [0, 1],
                tickwidth: 1,
                nticks: 8,
                mirror: true,
                title: 'Stage (meters relative to NAVD88)',
                autorange: true,
                //range: [-1, 8],
            }
        };
        if (typeof levels !== "undefined") {
            Array.prototype.push.apply(layout["shapes"],[
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
                    fillcolor: '#FF0000',
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
                    y1: levels[3]+0.5,
                    fillcolor: '#d90093',
                    opacity: 0.5,
                    line: {
                        width: 0
                    }
                }
            ]);
            Array.prototype.push.apply(layout["annotations"],[
                {
                    xref: "paper",
                    yref: "y",
                    x: 0.01,
                    y: levels[0],
                    yshift: 8,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "left",
                    text: 'Action: '+levels[0]+' m',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                },
                {
                    xref: "paper",
                    yref: "y",
                    x: 0.01,
                    y: levels[1],
                    yshift: 8,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "left",
                    text: 'Minor: '+levels[1]+' m',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                },
                {
                    xref: "paper",
                    yref: "y",
                    x: 0.01,
                    y: levels[2],
                    yshift: 8,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "left",
                    text: 'Moderate: '+levels[2]+' m',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                },
                {
                    xref: "paper",
                    yref: "y",
                    x: 0.01,
                    y: levels[3],
                    yshift: 8,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.95,
                    layer: "above",
                    "xanchor": "left",
                    text: 'Major: '+levels[3]+' m',
                    font: {
                        color: "black"
                    },
                    arrowhead: 0,
                    ax: 0,
                    ay: 0
                }
            ]);
        }
        Plotly.newPlot(domNode, data, layout, {displayModeBar: false, responsive: true});
        //if this station has an IOT sensor we'll load the recent data and add it to the chart
        if (typeof iot !== 'undefined') {
            Plotly.d3.csv(dataDomain + "/IOT/" + iot + "/running.csv?v="+Math.round(Math.random()*100000000).toString(), function (err, rows) {
                let sensorObservation = {
                    type: "scatter",
                    mode: 'lines+markers',
                    name: 'IoT Sensor',
                    hoverinfo: "y",
                    x: unpack(rows, 'date'),
                    y: unpack(rows, 'water_level_2'), //sensor 2 is the good one
                    line: {
                        color: '#44cbcb',
                        width: 1
                    },
                    marker: {
                        color: '#44cbcb',
                        width: 0.25
                    },
                    xaxis: 'x1',
                    yaxis: 'y1'
                };
                Plotly.addTraces(domNode, sensorObservation);
            });
            // Plotly.d3.csv(dataDomain + "/IOT/hobo1/running.csv?v="+Math.round(Math.random()*100000000).toString(), function (err, rows) {
            //     let sensorObservation = {
            //         type: "scatter",
            //         mode: 'lines+markers',
            //         name: 'HOBO Sensor',
            //         hoverinfo: "y",
            //         x: unpack(rows, 'date'),
            //         y: unpack(rows, 'water_level'), //sensor 2 is the good one
            //         line: {
            //             color: '#44cb00',
            //             width: 1
            //         },
            //         marker: {
            //             color: '#44cb00',
            //             width: 0.25
            //         },
            //         xaxis: 'x1',
            //         yaxis: 'y1'
            //     };
            //     Plotly.addTraces(domNode, sensorObservation);
            // });
        }
        //if this station has NOAA observation data we'll load that too
        if (marker["agency"] === "NOAA" && typeof noaaId !== 'undefined') {
            function noaaWaterUnpack(rows, key) {
                return rows.map(function (row) {
                    return parseFloat(row[key]) + navdOffset;
                });
            }
            let noaaStart = moment().subtract(1,'days').format('YYYYMMDD');
            let noaaEnd = moment().add(1,'days').format('YYYYMMDD');
            let noaaUrl = "https://tidesandcurrents.noaa.gov/api/datagetter?product=water_level&application=NOS.COOPS.TAC.WL&begin_date="+noaaStart+"&end_date="+noaaEnd+"&datum=MLLW&station="+noaaId+"&time_zone=GMT&units=metric&format=csv";
            Plotly.d3.csv(noaaUrl, function (err, rows) {
                let noaaObservation = {
                    type: "scatter",
                    mode: 'lines+markers',
                    name: 'Observed',
                    hoverinfo: "y",
                    x: unpack(rows, 'Date Time'),
                    y: noaaWaterUnpack(rows, ' Water Level'),
                    line: {
                        color: '#0000FF',
                        width: 1
                    },
                    marker: {
                        color: '#0000FF',
                        width: 0.25
                    },
                    xaxis: 'x1',
                    yaxis: 'y1'
                };
                Plotly.addTraces(domNode, noaaObservation);
            });
        }
    });
}

function makePlotStationValidation(url, domNode, title) {
    Plotly.d3.tsv(url, function (err, rows) {
        function unpack(rows, key) {
            date_start_plot = rows[0].iflood_date;
            date_stop_plot = rows[rows.length - 1].iflood_date;
            date_now_plot = rows[0].iflood_date;
            date_now1_plot = rows[2].iflood_date;

            return rows.map(function (row) {
                return row[key];
            });
        }
        let data = [];
        if (rows[0].hasOwnProperty("iflood_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'iflood',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'iflood_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("etss_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'ETSS',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'etss_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("ahps_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'AHPS',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'ahps_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("estofs_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'ESTOFS',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'estofs_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("cbofs_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'CBOFS',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'cbofs_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("ensemble_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines',
                name: 'Ensemble',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'ensemble_bias'),
                line: {
                    color: 'orange',
                    width: 1
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        if (rows[0].hasOwnProperty("ensemble_upper_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines',
                name: '95% CI',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'ensemble_upper_bias'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
            data.push({
                type: "scatter",
                mode: 'lines',
                name: '95% CI',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'ensemble_lower_bias'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        let layout = {
            showlegend: true,
            hovermode: "x",
            "spikedistance": "data",
            showcrossline: "true",
            title: title,
            legend: {
                orientation: "h",
                yanchor: "bottom",
                y: -0.5,
                font: {
                    size: 10
                }
            },
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
                    source: "/MasonM.png",
                    xref: "paper",
                    yref: "paper",
                    x: .87,
                    y: .985,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.25,
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
                    opacity: 0.05,
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
                    opacity: 0.05,
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
                title: 'Lead Time (hours)',
                range: [1, 24],
            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(255,255,255,0.3)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                tick0: 0,
                domain: [0, 1],
                tickwidth: 1,
                nticks: 4,
                mirror: true,
                title: 'BIAS (meters relative to NAVD)',
                range: [-2, 2],
            }
        };
        Plotly.newPlot(domNode, data, layout, {displayModeBar: false, responsive: true});
    });
}

function makePlotStationRealtimeValidation(url, domNode, title, marker) {
    let levels = marker["floodLevels"];
    let iot = marker["iotId"];
    let noaaId = marker["noaaId"];
    let navdOffset = marker["navdOffset"];
    Plotly.d3.tsv(url, function (err, rows) {
        function unpack(rows, key) {
            return rows.map(function (row) {
                return row[key];
            });
        }
        let data = [];
        let layout = {
            showlegend: true,
            hovermode: "x",
            "spikedistance": "data",
            "showcrossline": "true",
            title: title,
            legend: {
                orientation: "h",
                yanchor: "bottom",
                y: -0.35,
                font: {
                    size: 10
                }
            },
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
                    opacity: 0.25,
                    layer: "above"
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
                autorange: true,

            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(153,153,153,0.5)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                tick0: 0,
                domain: [0, 1],
                tickwidth: 1,
                nticks: 8,
                mirror: true,
                title: 'Bias (meters)',
                range: [-2, 2],
            }
        };
        Plotly.newPlot(domNode, data, layout, {displayModeBar: false, responsive: true});
        //if this station has an IOT sensor we'll load the recent data and add it to the chart
        if (typeof iot !== 'undefined') {
            Plotly.d3.csv(dataDomain + "/IOT/" + iot + "/running.csv?v="+Math.round(Math.random()*100000000).toString(), function (err, iotRows) {
                let ifloodDates = unpack(rows, 'iflood_date');
                let ifloodValues = unpack(rows, 'iflood');
                let iotDates = unpack(iotRows, 'date');
                let iotValues = unpack(iotRows, 'water_level_2');
                let comparisonDates = [];
                let comparisonValues = [];
                for (let i = 0; i < ifloodDates.length; i++) {
                    //search for the closest date from the iot data
                    for (let j = 0; j < iotDates.length; j++) {
                        if (iotDates[j] >= ifloodDates[i]) { //dates can be compared as strings
                            comparisonDates.push(iotDates[j]);
                            comparisonValues.push(ifloodValues[i]-iotValues[j]);
                            break;
                        }
                    }
                }
                let ifloodComparison = {
                    type: "scatter",
                    mode: 'lines+markers',
                    name: 'iFLOOD',
                    hoverinfo: "y",
                    x: comparisonDates,
                    y: comparisonValues,
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
                Plotly.addTraces(domNode, ifloodComparison);
            });
        }
        else if (marker["agency"] === "NOAA" && typeof noaaId !== 'undefined') {
            function noaaWaterUnpack(rows, key) {
                return rows.map(function (row) {
                    return parseFloat(row[key]) + navdOffset;
                });
            }
            let noaaStart = moment().subtract(1,'days').format('YYYYMMDD');
            let noaaEnd = moment().add(1,'days').format('YYYYMMDD');
            let noaaUrl = "https://tidesandcurrents.noaa.gov/api/datagetter?product=water_level&application=NOS.COOPS.TAC.WL&begin_date="+noaaStart+"&end_date="+noaaEnd+"&datum=MLLW&station="+noaaId+"&time_zone=GMT&units=metric&format=csv";
            Plotly.d3.csv(noaaUrl, function (err, noaaRows) {
                let datasets = {
                    //label:[time column, data column, color, markers]
                    "iFLOOD":["iflood_date","iflood","#008000", true],
                    "ETSS":["Time_etss","etss","rgb(204, 0, 204)", false],
                    "AHPS":["Time_ahps","ahps","red", true],
                    "ESTOFS":["iflood_date","estofs","#00bc7d", false],
                    "CBOFS":["iflood_date","cbofs","brown", false],
                    "Ensemble":["Time_ensemble","ensemble","orange", false],
                };
                Object.keys(datasets).forEach(label => {
                    if (!rows[0].hasOwnProperty(datasets[label][1]))
                        return;
                    let sourceDates = unpack(rows, datasets[label][0]);
                    let sourceValues = unpack(rows, datasets[label][1]);
                    let noaaDates = unpack(noaaRows, 'Date Time');
                    let noaaValues = noaaWaterUnpack(noaaRows, ' Water Level');
                    let comparisonDates = [];
                    let comparisonValues = [];
                    for (let i = 0; i < sourceDates.length; i++) {
                        //search for the closest date from the noaa data
                        for (let j = 0; j < noaaDates.length; j++) {
                            if (sourceDates[i] !== "" && noaaDates[j] >= sourceDates[i]) { //dates can be compared as strings
                                comparisonDates.push(noaaDates[j]);
                                comparisonValues.push(sourceValues[i]-noaaValues[j]);
                                break;
                            }
                        }
                    }
                    let noaaComparison = {
                        type: "scatter",
                        mode: datasets[label][3] ? 'lines+markers' : 'lines',
                        name: label,
                        hoverinfo: "y",
                        x: comparisonDates,
                        y: comparisonValues,
                        line: {
                            color: datasets[label][2],
                            width: 1
                        },
                        marker: {
                            color: datasets[label][2],
                            width: 0.25
                        },
                        xaxis: 'x1',
                        yaxis: 'y1'
                    };
                    Plotly.addTraces(domNode, noaaComparison);
                });
            });
        }
    });
}

function makePlotStationWaves(url, domNode, title) {
    Plotly.d3.tsv(url, function (err, rows) {
        let date_start_plot;
        let date_stop_plot;
        function unpack(rows, key) {
            date_start_plot = rows[0]["iflood_date"];
            date_stop_plot = rows[rows.length - 1]["iflood_date"];
            return rows.map(function (row) {
                return row[key];
            });
        }
        let data = [];
        if (rows[0].hasOwnProperty("iflood")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'iFLOOD',
                hoverinfo: "y",
                x: unpack(rows, 'iflood_date'),
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
            });
        }
        if (rows[0].hasOwnProperty("US East")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'WW3:Regional',
                hoverinfo: "y",
                x: unpack(rows, 'US East_time'),
                y: unpack(rows, 'US East'),
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
            });
        }
        if (rows[0].hasOwnProperty("global")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'WW3:Global',
                hoverinfo: "y",
                x: unpack(rows, 'global_time'),
                y: unpack(rows, 'global'),
                line: {
                    color: 'brown',
                    width: 1
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        if (rows[0].hasOwnProperty("nwps_lwx")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'NWPS:LWX',
                hoverinfo: "y",
                x: unpack(rows, 'nwps_lwx_time'),
                y: unpack(rows, 'nwps_lwx'),
                line: {
                    color: '#e646e7',
                    width: 1
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        if (rows[0].hasOwnProperty("ensemble")) {
            data.push({
                type: "scatter",
                mode: "lines+markers",
                name: 'Ensemble',
                hoverinfo: "y",
                x: unpack(rows, 'ensemble_index'),
                y: unpack(rows, 'ensemble'),
                line: {
                    color: 'orange',
                    width: 1
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        if (rows[0].hasOwnProperty("ensemble_upper")) {
            data.push({
                type: "scatter",
                mode: "lines",
                name: '95% CI',
                hoverinfo: "y",
                x: unpack(rows, 'ensemble_index'),
                y: unpack(rows, 'ensemble_upper'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
            data.push({
                type: "scatter",
                mode: "lines",
                name: '95% CI',
                hoverinfo: "y",
                x: unpack(rows, 'ensemble_index'),
                y: unpack(rows, 'ensemble_lower'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        if (rows[0].hasOwnProperty("observed")) {
            data.push({
                type: "scatter",
                mode: "lines+markers",
                name: 'Observed',
                hoverinfo: "y",
                x: unpack(rows, 'observed_time'),
                y: unpack(rows, 'observed'),
                line: {
                    color: 'blue',
                    width: 1
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }

        let layout = {
            showlegend: true,
            hovermode: "x",
            "spikedistance": "data",
            "showcrossline": "true",
            title: title,
            legend: {
                orientation: "h",
                yanchor: "bottom",
                y: -0.35,
                font: {
                    size: 10
                }
            },
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
                    opacity: 0.25,
                    layer: "above"
                }],
            annotations: [
                {
                    x: date_start_plot,
                    xshift: 10,
                    yref: "paper",
                    yanchor: "middle",
                    y: 0.5,
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
                    x0: getRealSelectedTimeString(),
                    y0: 0,
                    x1: getRealSelectedTimeString(),
                    y1: 1,
                    yref: "paper",
                    opacity: 0.5,
                    line: {
                        color: 'rgb(32,81,124)',
                        width: 2
                    }
                },
                {
                    type: 'line',
                    layer: 'above',
                    yref: "paper",
                    x0: date_start_plot,
                    y0: 0,
                    x1: date_start_plot,
                    y1: 1,
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
                }
            ],
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
                autorange: true

            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(153,153,153,0.5)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                tick0: 0,
                domain: [0, 1],
                tickwidth: 1,
                nticks: 8,
                mirror: true,
                title: 'Significant Wave Height (meters)',
                autorange: true,
                //range: [-1, 8],
            }
        };
        Plotly.newPlot(domNode, data, layout, {displayModeBar: false, responsive: true});
    });
}

function makePlotStationWavesValidation(url, domNode, title) {
    Plotly.d3.tsv(url, function (err, rows) {
        function unpack(rows, key) {
            date_start_plot = rows[0].iflood_date;
            date_stop_plot = rows[rows.length - 1].iflood_date;
            date_now_plot = rows[0].iflood_date;
            date_now1_plot = rows[2].iflood_date;

            return rows.map(function (row) {
                return row[key];
            });
        }
        let data = [];
        if (rows[0].hasOwnProperty("iflood_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'iflood',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'iflood_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("global_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'Global',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'global_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("US_East_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'US East',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'US_East_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("nwps_lwx_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines+markers',
                name: 'NWPS LWX',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'nwps_lwx_bias'),
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
            });
        }
        if (rows[0].hasOwnProperty("ensemble_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines',
                name: 'Ensemble',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'ensemble_bias'),
                line: {
                    color: 'orange',
                    width: 1
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }
        if (rows[0].hasOwnProperty("ensemble_upper_bias")) {
            data.push({
                type: "scatter",
                mode: 'lines',
                name: '95% CI',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'ensemble_upper_bias'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
            data.push({
                type: "scatter",
                mode: 'lines',
                name: '95% CI',
                hoverinfo: "y",
                x: Array.from(Array(25).keys()).slice(1),
                y: unpack(rows, 'ensemble_lower_bias'),
                line: {
                    color: 'gray',
                    width: 0.75
                },
                xaxis: 'x1',
                yaxis: 'y1'
            });
        }

        let layout = {
            showlegend: true,
            hovermode: "x",
            "spikedistance": "data",
            showcrossline: "true",
            title: title,
            legend: {
                orientation: "h",
                yanchor: "bottom",
                y: -0.5,
                font: {
                    size: 10
                }
            },
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
                    source: "/MasonM.png",
                    xref: "paper",
                    yref: "paper",
                    x: .87,
                    y: .985,
                    sizex: 0.25,
                    sizey: 0.25,
                    opacity: 0.25,
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
                    opacity: 0.05,
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
                    opacity: 0.05,
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
                title: 'Lead Time (hours)',
                range: [1, 24],
            },
            yaxis: {
                showgrid: true,
                gridcolor: 'rgba(255,255,255,0.3)',
                gridwidth: .25,
                linecolor: 'rgb(153, 153, 153)',
                linewidth: 1,
                tick0: 0,
                domain: [0, 1],
                tickwidth: 1,
                nticks: 4,
                mirror: true,
                title: 'BIAS (meters)',
                range: [-2, 2],
            }
        };
        Plotly.newPlot(domNode, data, layout, {displayModeBar: false, responsive: true});
    });
}
