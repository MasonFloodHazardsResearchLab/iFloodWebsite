const systemOrder = [
    "iFLOOD",
    "ETSS",
    "ESTOFS",
    "CBOFS"
];
const statistics = [
    {
        "displayName": "RMS Error",
        "id": "RMSE",
        "unit": "(m)",
        "range": [0,0.04]
    },
    {
        "displayName": "Forecast Skill",
        "id": "SKILL",
        "unit": "",
        "range": [0,1]
    }
];
const scales = [
    "Lifetime",
    "Yearly",
    "Monthly",
    "Weekly",
    "Daily"
];

let scaleCanvas = $('#scaleCanvas')[0];
let scaleCtx = scaleCanvas.getContext('2d');

let maps = [];
let infoWindow = new google.maps.InfoWindow({disableAutoPan: true});
let activeMap = 0;
let circles = [];

let currentScale = "week";
let currentData;
let currentStat = 0;

//time tabs
scales.forEach((scale, i) => {
    let tab = $('<div>',{
        'class':'tab',
        'id':'tab'+scale,
        'text':scale
    });
    tab.click(function() {
        loadData(scale);
        $('#statScaleContainer .tab').removeClass('current');
        $(this).addClass('current');
    });
    $('#statScaleContainer').append(tab);
});
$('#statScaleContainer #tabWeekly').addClass('current');

//stat tabs
statistics.forEach((stat, i) => {
    let tab = $('<div>',{
        'class':'tab',
        'id':'tab'+stat["id"],
        'text':stat["displayName"]
    });
    tab.click(function() {
        showStat(i);
        $('#statTabContainer .tab').removeClass('current');
        $(this).addClass('current');
    });
    $('#statTabContainer').append(tab);
});
$('#statTabContainer .tab').first().addClass('current');

loadData('Weekly');

for (let i = 0; i < 4; i++) {
    maps[i] = new google.maps.Map(document.getElementById('map'+i.toString()), {
        zoom: 7,
        gestureHandling: window.matchMedia('(min-width: 600px)').matches ? 'greedy' : 'cooperative',
        mapTypeId: 'roadmap',
        center: {lat: 38.2, lng: -76.325},
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: false,
        mapTypeControl: false,
        styles: mapstyle
    });
    google.maps.event.addListener(maps[i], 'center_changed', function() {
        if (activeMap === i)
            moveAll(maps[i].getCenter(), i);
    });
    google.maps.event.addListener(maps[i], 'zoom_changed', function() {
        if (activeMap === i)
            zoomAll(maps[i].getZoom(), i);
    });
    google.maps.event.addListener(maps[i], 'mousemove', function() {
        activeMap = i;
    });
    google.maps.event.addListener(maps[i], 'drag', function() {
        activeMap = i;
    });
}

function loadData(scale) {
    $.get("https://data.iflood.vse.gmu.edu/Forecast/ChesapeakeBay_ADCIRCSWAN/recent.txt?v="+Math.round(Math.random()*100000000).toString(), function(recentRun) {
        $.get("https://data.iflood.vse.gmu.edu/Forecast/ChesapeakeBay_ADCIRCSWAN/"+recentRun+"/meta/"+scale.toLowerCase()+".json", function(data) {
            currentData = data;
            currentScale = scale;
            showStat(currentStat);
        });
    });
}
function showStat(stat) {
    currentStat = stat;
    circles.forEach(circle => {
        circle.setMap(null);
    });
    circles = [];

    let statObj = statistics[stat];

    for (let i = 0; i < 4; i++) {
        let systemData = currentData[systemOrder[i]];
        for (let j = 0; j < systemData["Stations"].length; j++) {
            let marker = markers[systemData["Stations"][j]];
            let value = systemData[statObj["id"]][j];
            let color;
            if (typeof value === "undefined" || value <= -9999 || value === null) {
                color = "#666666";
                value = "[no data]"
            }
            else {
                let rangePoint = value / statObj["range"][1];
                color = getColorPoint(colorRanges['jet'], rangePoint);
            }
            let circle = new google.maps.Circle({
                strokeColor: "#000000",
                strokeWeight: 0.5,
                strokeOpacity: 0.5,
                fillColor: color,
                fillOpacity: 0.4,
                map: maps[i],
                center: marker["pos"],
                radius: 1500000 / Math.pow(2, maps[i].getZoom())
            });
            google.maps.event.addListener(circle, 'mouseover',function() {
                infoWindow.setContent(value.toString());
                infoWindow.setPosition(marker["pos"]);
                infoWindow.open(maps[i]);
            });
            google.maps.event.addListener(circle, 'mouseout',function() {
                infoWindow.close();
            });
            circles.push(circle);
        }
    }

    drawScale(
        statObj["range"][0],
        statObj["range"][1],
        statObj["displayName"] + " " + statObj["unit"]
    );
}

window.addEventListener('resize', function() {
    let statObj = statistics[currentStat];
    drawScale(
        statObj["range"][0],
        statObj["range"][1],
        statObj["displayName"] + " " + statObj["unit"]
    );
});

function drawScale(min,max,text) {
    scaleCanvas.width = scaleCanvas.clientWidth*window.devicePixelRatio;
    scaleCanvas.height = scaleCanvas.clientHeight*window.devicePixelRatio;
    scaleCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);

    let width = scaleCanvas.clientWidth;
    let height = scaleCanvas.clientHeight;

    scaleCtx.clearRect(0,0,width,height);
    for (let i = 0; i < width; i++) {
        scaleCtx.fillStyle = getColorPoint(colorRanges['jet'],i/width);
        scaleCtx.fillRect(i,0,2,15);
    }
    scaleCtx.fillStyle = "#FFFFFF";
    scaleCtx.font = "18px Mukta";
    scaleCtx.textAlign = "left";
    scaleCtx.save();
    //numbers
    scaleCtx.rotate(Math.PI/2);
    scaleCtx.fillText(Number((min).toFixed(2)).toString(),18,-2);
    scaleCtx.fillText(Number((max).toFixed(2)).toString(),18,(-width)+15);
    scaleCtx.restore();
    scaleCtx.font = "22px Mukta";
    scaleCtx.textAlign = "center";
    scaleCtx.fillText(text,width/2,70);
}

function moveAll(center, exclude) {
    for (let i = 0; i < 4; i++) {
        if (i === exclude)
            continue;
        maps[i].setCenter(center);
    }
}
function zoomAll(zoom, exclude) {
    for (let i = 0; i < 4; i++) {
        if (i === exclude)
            continue;
        maps[i].setZoom(zoom);
    }
    circles.forEach(circle => {
        circle.setRadius(1500000 / Math.pow(2, zoom));
    })
}

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