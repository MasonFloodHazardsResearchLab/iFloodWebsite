const apiUrl = "https://qkwvc38gw2.execute-api.us-east-1.amazonaws.com/prod";


const templateAlertBoxLocation = $.templates("#templateAlertBoxLocation");
const templateAlertBoxStation = $.templates("#templateAlertBoxStation");

const chosenAlerts = $("#chosenAlerts");

let contactIcon = $('#contactIcon');
let phoneNotice = $('#phoneNotice');
$('#primaryContactInput').on('input', function() {
    if ($(this).val().match(/^\+?[0-9 \-()]{3,}$/)) { //if it looks like a phone number
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

let stationMarkers = {};

for (let markerIndex in markers) {
    if (!markers.hasOwnProperty(markerIndex))
        continue;
    let marker = markers[markerIndex];
    stationMarkers[marker["stationStr"]] = new google.maps.Marker({
        map: map,
        draggable: false,
        title: marker["title"],
        position: marker["pos"]
    });
    stationMarkers[marker["stationStr"]].addListener('click', function () {
        if (!stationAlertExists(marker["stationStr"]))
            addStationAlert(marker["stationStr"]);
    });
}

$("#addLocationButton").click(addLocationAlert);
$("#addStationButton").click(addStationAlert);

addLocationAlert(false); //start with one location by default
$('#primaryContactInput').focus();

function addLocationAlert(shouldFocus) {
    let uid = generateUID();
    let dom = $(templateAlertBoxLocation.render());
    dom.data("uid",uid);
    chosenAlerts.append(dom);
    setTimeout(function() {
        dom.removeClass("hide");
    },0);
    alerts[uid] = {
        "type":"location",
        "dom":dom
    };
    let autocomplete = new google.maps.places.Autocomplete(dom.find(".addressInput")[0]);
    autocomplete.addListener('place_changed', function() {
        let place = autocomplete.getPlace();
        if (typeof alerts[uid]["marker"] !== "undefined")
            alerts[uid]["marker"].setMap(null);
        let marker = new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
        marker.setIcon({
            "url": "icons/homeMap.svg",
            "anchor": new google.maps.Point(15, 44),
            "scaledSize": new google.maps.Size(30, 45),
        });
        let address = "";
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        alerts[uid]["marker"] = marker;
        alerts[uid]["address"] = address || "Untitled Location "+uid;
        alerts[uid]["lat"] = place.geometry.location.lat();
        alerts[uid]["lng"] = place.geometry.location.lng();
        dom.find(".addressDisplay").text("Lat: "+alerts[uid]["lat"]+", Lon: "+alerts[uid]["lng"]);
        dom.removeClass("error");
        // else {
        //     delete alerts[uid]["address"];
        //     delete alerts[uid]["lat"];
        //     delete alerts[uid]["lng"];
        //     dom.addClass("error");
        // }
    });
    dom.find(".closeButton").click(function() {
        dom.remove();
        if (typeof alerts[uid]["marker"] !== "undefined")
            alerts[uid]["marker"].setMap(null);
        delete alerts[uid];
    });
    if (typeof shouldFocus === "undefined" || shouldFocus) {
        dom.find(".addressInput").focus();
        $("html, body").animate({scrollTop: $(document).height()}, 150);
    }
}

const levelIcons = [
    null,
    "icons/actionMap.svg",
    "icons/minorMap.svg",
    "icons/moderateMap.svg",
    "icons/majorMap.svg"
];
function addStationAlert(stationStr) {
    let uid = generateUID();
    let dom = $(templateAlertBoxStation.render());
    dom.data("uid",uid);
    chosenAlerts.append(dom);
    dom.offsetHeight; //hack to force browser to acknowledge height
    setTimeout(function() {
        dom.removeClass("hide");
    },0);
    alerts[uid] = {
        "type":"station",
        "dom":dom,
        "level":2
    };
    let select = dom.find(".stationSelect");
    $.each(markers, function() {
        select.append($("<option />").val(this["stationStr"]).text(this["title"]));
    });
    if (typeof stationStr === "string") {
        select.val(stationStr);
        alerts[uid]["station"] = stationStr;
        stationMarkers[stationStr].setIcon({
            "url": "icons/minorMap.svg",
            "anchor": new google.maps.Point(15, 44),
            "scaledSize": new google.maps.Size(30, 45),
        });
    }
    else {
        select.val("");
    }
    select.on("input",function() {
        if (typeof alerts[uid]["station"] !== "undefined" && alerts[uid]["station"] !== "")
            stationMarkers[alerts[uid]["station"]].setIcon(null);
        alerts[uid]["station"] = $(this).val();
        stationMarkers[alerts[uid]["station"]].setIcon({
            "url": levelIcons[alerts[uid]["level"]],
            "anchor": new google.maps.Point(15, 44),
            "scaledSize": new google.maps.Size(30, 45),
        });
        updateStationDropdowns();
    });
    dom.find(".thresholdBar .choice").click(function() {
        dom.find(".thresholdBar .choice").removeClass("selected");
        $(this).addClass("selected");
        if ($(this).hasClass("action"))
            alerts[uid]["level"] = 1;
        else if ($(this).hasClass("minor"))
            alerts[uid]["level"] = 2;
        else if ($(this).hasClass("moderate"))
            alerts[uid]["level"] = 3;
        else if ($(this).hasClass("major"))
            alerts[uid]["level"] = 4;
        if (typeof alerts[uid]["station"] !== "undefined" && alerts[uid]["station"] !== "") {
            stationMarkers[alerts[uid]["station"]].setIcon({
                "url": levelIcons[alerts[uid]["level"]],
                "anchor": new google.maps.Point(15, 44),
                "scaledSize": new google.maps.Size(30, 45),
            });
        }
    });
    dom.find(".closeButton").click(function() {
        if (typeof alerts[uid]["station"] !== "undefined" && alerts[uid]["station"] !== "")
            stationMarkers[alerts[uid]["station"]].setIcon(null);
        dom.remove();
        delete alerts[uid];
        updateStationDropdowns();
    });
    $("html, body").animate({ scrollTop: $(document).height() }, 150);
    updateStationDropdowns();
}

$('#submitAlertsButton').click(submit);
function submit() {
    //check contact information
    let contactValue = $('#primaryContactInput').val();
    let primaryContact = "";
    if (contactValue.match(/^\+?[0-9 -()]{3,}$/)) { //if it looks like a phone number
        if (!contactValue.includes("+"))
            primaryContact = "+1"+contactValue.replace(/[^+0-9]/g,"");
        else
            primaryContact = contactValue.replace(/[^+0-9]/g,"");
    }
    else if (contactValue.match(/^[^ ]*@[^ ]*\.[^ ]*/)) {
        primaryContact = contactValue;
    }
    if (primaryContact === "") {
        $('#primaryContactInput').addClass("error");
        $('#submitError').text("Enter a valid phone number or email address.");
        return;
    }
    else {
        $('#primaryContactInput').removeClass("error");
    }
    //make sure they picked some alerts
    if ($.isEmptyObject(alerts)) {
        $('#submitError').text("Select at least one alert.");
        return;
    }
    let alertsObject = {
        "primaryContact": primaryContact,
        "alerts": {
            "locations": [],
            "stations": {}
        }
    };
    for (let alertIndex in alerts) {
        if (!alerts.hasOwnProperty(alertIndex))
            continue;
        let alert = alerts[alertIndex];
        if (alert["type"] === "location") {
            if (typeof alert["address"] === "undefined") {
                alert["dom"].addClass("error");
                $('#submitError').text("Select a location.");
                return;
            }
            else {
                alert["dom"].removeClass("error");
                alertsObject["alerts"]["locations"].push({
                    "displayName":alert["address"],
                    "lat":alert["lat"],
                    "lng":alert["lng"]
                });
            }
        }
        else if (alert["type"] === "station") {
            if (typeof alert["station"] === "undefined") {
                alert["dom"].addClass("error");
                $('#submitError').text("Select a station.");
                return;
            }
            else {
                alert["dom"].removeClass("error");
                alertsObject["alerts"]["stations"][alert["station"]] = alert["level"];
            }
        }
    }
    $.ajax({
        url: apiUrl+"/adduser",
        type: 'POST',
        crossDomain: true,
        data: JSON.stringify(alertsObject),
        contentType: "application/json",
        success: function(data, textStatus, xhr) {
            if (xhr.status === 200) {
                $('#primaryContactInput').prop('disabled', true);
                $('#alertArea').addClass('hide');
                $('#successMessage').removeClass('hide');
                $('#successMessage .details').text($('#successMessage .details').text().replace("{primary}",primaryContact));
            }
            else {
                $('#submitError').text(data);
            }
        }
    }).fail(function() {
        $('#submitError').text("Something went wrong. Try again later.");
    });
}

function updateStationDropdowns() {
    for (let stationIndex in stationMarkers) {
        if (!stationMarkers.hasOwnProperty(stationIndex))
            continue;
        if (stationAlertExists(stationIndex))
            $('option[value="'+stationIndex+'"]').prop( "disabled", true);
        else
            $('option[value="'+stationIndex+'"]').prop( "disabled", false);
    }
}

function stationAlertExists(stationStr) {
    for (let alertIndex in alerts) {
        if (!alerts.hasOwnProperty(alertIndex))
            continue;
        let alert = alerts[alertIndex];
        if (alert["type"] === "station" && alert["station"] === stationStr)
            return true;
    }
    return false;
}

function generateUID() {
    let firstPart = (Math.random() * 46656) | 0;
    let secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}
