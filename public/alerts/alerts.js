const templateAlertBoxLocation = $.templates("#templateAlertBoxLocation");
const templateAlertBoxStation = $.templates("#templateAlertBoxStation");

const chosenAlerts = $("#chosenAlerts");
const geocoder = new google.maps.Geocoder();

map = new google.maps.Map(document.getElementById('map'), {
    zoom: 7,
    gestureHandling: 'cooperative',
    mapTypeId: 'roadmap',
    center: {lat: 38.2, lng: -76.325},
    streetViewControl: false,
    fullscreenControl: false,
    zoomControl: false,
    mapTypeControl: false,
    styles: mapstyle
});

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
}

let contactIcon = $('#contactIcon');
let phoneNotice = $('#phoneNotice');
$('#primaryContactInput').on('input', function() {
    if ($(this).val().match(/^\+?[0-9 -()]{3,}$/)) { //if it looks like a phone number
        contactIcon.removeClass("mail");
        contactIcon.addClass("phone");
        if (!$(this).val().includes("+")) {
            phoneNotice.addClass("show");
        }
        else {
            phoneNotice.removeClass("show");
        }
    }
    else if ($(this).val().match(/^[^ ]*@[^ ]*\.[^ ]*/)) { //if it looks like an email
        contactIcon.removeClass("phone");
        contactIcon.addClass("mail");
        phoneNotice.removeClass("show");
    }
    else {
        contactIcon.removeClass("mail");
        contactIcon.removeClass("phone");
        phoneNotice.removeClass("show");
    }
});

let alerts = {};

$("#addLocationButton").click(addLocationAlert);
$("#addStationButton").click(addStationAlert);

addLocationAlert(); //start with one location by default
$('#primaryContactInput').focus();

function addLocationAlert() {
    let uid = generateUID();
    let dom = $(templateAlertBoxLocation.render());
    dom.data("uid",uid);
    chosenAlerts.append(dom);
    alerts[uid] = {
        "dom":dom
    };
    dom.find(".addressInput").focus();
    dom.find(".addressInput").on("change", function() {
        if ($(this).val() === "" || $(this).val() === " ")
            return;
        geocoder.geocode({ 'address': $(this).val() }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                if (typeof alerts[uid]["marker"] !== "undefined")
                    alerts[uid]["marker"].setMap(null);
                let marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                marker.setIcon({
                    "url": "icons/homeMap.svg",
                    "anchor": new google.maps.Point(15, 44),
                    "scaledSize": new google.maps.Size(30, 45),
                });
                alerts[uid]["marker"] = marker;
                alerts[uid]["lat"] = results[0].geometry.location.lat();
                alerts[uid]["lng"] = results[0].geometry.location.lng();
            }
        });
    });
    dom.find(".closeButton").click(function() {
        dom.remove();
        if (typeof alerts[uid]["marker"] !== "undefined")
            alerts[uid]["marker"].setMap(null);
        delete alerts[uid];
    });
    window.scrollTo(0,document.body.scrollHeight);
}

function addStationAlert() {
    let uid = generateUID();
    let dom = $(templateAlertBoxStation.render());
    dom.data("uid",uid);
    chosenAlerts.append(dom);
    alerts[uid] = {
        "dom":dom
    };
    let select = dom.find(".stationSelect");
    $.each(markers, function() {
        select.append($("<option />").val(this["stationStr"]).text(this["title"]));
    });
    dom.find(".thresholdBar .choice").click(function() {
        dom.find(".thresholdBar .choice").removeClass("selected");
        $(this).addClass("selected");
    });
    dom.find(".closeButton").click(function() {
        dom.remove();
        delete alerts[uid];
    });
    window.scrollTo(0,document.body.scrollHeight);
}

function generateUID() {
    let firstPart = (Math.random() * 46656) | 0;
    let secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}