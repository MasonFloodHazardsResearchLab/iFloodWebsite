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
        "range": [0,0.04]
    },
    {
        "displayName": "Forecast Skill",
        "id": "SKILL",
        "range": [0,1]
    }
];

let maps = [];
let activeMap = 0;
let circles = [];

for (let i = 0; i < 4; i++) {
    maps[i] = new google.maps.Map(document.getElementById('map'+i.toString()), {
        zoom: 7,
        gestureHandling: 'greedy',
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

$.get('https://s3.amazonaws.com/gmu-iflood-data/test/stats_meta.json', function(data) {
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < data[systemOrder[i]]["Stations"].length; j++) {
            let marker = markers[data[systemOrder[i]]["Stations"][j]];
            let color = getColorPoint(colorRanges['jet'], data[systemOrder[i]]["RMSE"][j]/0.04);
            circles.push(new google.maps.Circle({
                strokeColor: "#000000",
                strokeWeight: 0.5,
                strokeOpacity: 0.5,
                fillColor: color,
                fillOpacity: 0.4,
                map: maps[i],
                center: marker["pos"],
                radius: 1500000 / Math.pow(2, maps[i].getZoom())
            }));
        }
    }
});

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