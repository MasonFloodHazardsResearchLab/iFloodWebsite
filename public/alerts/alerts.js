const apiUrl = "https://qkwvc38gw2.execute-api.us-east-1.amazonaws.com/prod";


const templateAlertBoxLocation = $.templates("#templateAlertBoxLocation");
const templateAlertBoxWater = $.templates("#templateAlertBoxWater");
const templateAlertBoxWaves = $.templates("#templateAlertBoxWaves");

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
        $('#alertArea').removeClass("disabled");
    }
    else if ($(this).val().match(/^[^ ]*@[^ ]*\.[^ ]*/)) { //if it looks like an email
        contactIcon.removeClass("phone");
        contactIcon.addClass("mail");
        phoneNotice.removeClass("show");
        $('#alertArea').removeClass("disabled");
    }
    else {
        contactIcon.removeClass("mail");
        contactIcon.removeClass("phone");
        phoneNotice.removeClass("show");
        $('#alertArea').addClass("disabled");
    }
});

let alerts = {};
let updating = false;
let verifyCode = null;

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

$("#addLocationButton").click(() => {addLocationAlert();});
$("#addWaterButton").click(() => {addWaterAlert();});
$("#addWavesButton").click(() => {addWavesAlert();});

//check hash to see if we are editing a subscription rather than creating one
if (window.location.hash && window.location.hash.includes(",")) {
    let parts = window.location.hash.slice(1).split(",");
    let primaryContact = parts[0];
    verifyCode = parts[1];
    console.log({primaryContact, verifyCode});
    $.get(apiUrl+"/getuser?primaryContact="+encodeURIComponent(primaryContact)+"&code="+verifyCode, function(data) {
        $('#primaryContactInput').val(primaryContact).prop('disabled',true);
        $('#alertArea').removeClass("disabled");
        if (typeof data['water'] !== 'undefined') {
            data['locations'].forEach((locationObj) => {
                addLocationAlert(false,locationObj);
            });
            Object.keys(data['water']).forEach((stationStr) => {
                addWaterAlert(stationStr,data['water'][stationStr]);
            });
            Object.keys(data['waves']).forEach((stationStr) => {
                addWavesAlert(stationStr,data['waves'][stationStr]);
            });
        }
        updating = true;
        $('#submitAlertsButton').text("Update");
    })
}
else {
    addLocationAlert(false); //start with one location by default
}

function addLocationAlert(shouldFocus, initialObj) {
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
    if (initialObj) {
        dom.find('.addressInput').val(initialObj["displayName"]);
        alerts[uid]["address"] = initialObj["displayName"];
        alerts[uid]["lat"] = initialObj["lat"];
        alerts[uid]["lng"] = initialObj["lng"];
        dom.find(".addressDisplay").text("Lat: "+alerts[uid]["lat"]+", Lon: "+alerts[uid]["lng"]);
        alerts[uid]["marker"] = new google.maps.Marker({
            map: map,
            position: {lat: alerts[uid]["lat"], lng: alerts[uid]["lng"]},
            icon: {
                "url": "icons/homeMap.svg",
                "anchor": new google.maps.Point(15, 44),
                "scaledSize": new google.maps.Size(30, 45),
            }
        });
    }
    let autocomplete = new google.maps.places.Autocomplete(dom.find(".addressInput")[0]);
    autocomplete.addListener('place_changed', function() {
        let place = autocomplete.getPlace();
        if (typeof alerts[uid]["marker"] !== "undefined")
            alerts[uid]["marker"].setMap(null);
        alerts[uid]["marker"] = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            icon: {
                "url": "icons/homeMap.svg",
                "anchor": new google.maps.Point(15, 44),
                "scaledSize": new google.maps.Size(30, 45),
            }
        });
        let address = "";
        if (place.address_components) {
            address = [
                (place.address_components[0] && place.address_components[0].short_name || ''),
                (place.address_components[1] && place.address_components[1].short_name || ''),
                (place.address_components[2] && place.address_components[2].short_name || '')
            ].join(' ');
        }
        alerts[uid]["address"] = address || "Untitled Location "+uid;
        alerts[uid]["lat"] = place.geometry.location.lat();
        alerts[uid]["lng"] = place.geometry.location.lng();
        dom.find(".addressDisplay").text("Lat: "+alerts[uid]["lat"]+", Lon: "+alerts[uid]["lng"]);
        dom.removeClass("error");
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
    {
        "url": "/map/sprites/markers/station/action.svg",
        "anchor": new google.maps.Point(17.5, 44),
        "scaledSize": new google.maps.Size(35, 45),
    },
    {
        "url": "/map/sprites/markers/station/minor.svg",
        "anchor": new google.maps.Point(17.5, 44),
        "scaledSize": new google.maps.Size(35, 45),
    },
    {
        "url": "/map/sprites/markers/station/moderate.svg",
        "anchor": new google.maps.Point(22.5, 49),
        "scaledSize": new google.maps.Size(45, 50),
    },
    {
        "url": "/map/sprites/markers/station/major.svg",
        "anchor": new google.maps.Point(22.5, 49),
        "scaledSize": new google.maps.Size(45, 50),
    }
];
function addWaterAlert(stationStr, level) {
    let uid = generateUID();
    let dom = $(templateAlertBoxWater.render());
    dom.data("uid",uid);
    chosenAlerts.append(dom);
    dom.offsetHeight; //hack to force browser to acknowledge height
    setTimeout(function() {
        dom.removeClass("hide");
    },0);
    alerts[uid] = {
        "type":"water",
        "dom":dom,
        "level":level || 2,
        "station":stationStr || "*ALL*"
    };
    let select = dom.find(".stationSelect");
    select.append($("<option />").val("*ALL*").text("[ All Stations ]"));
    Object.values(markers).forEach(marker => {
        if (marker["hasWater"] && marker["floodLevels"])
            select.append($("<option />").val(marker["stationStr"]).text(marker["title"]));
    });
    if (alerts[uid]["station"] !== "*ALL*") {
        select.val(alerts[uid]["station"]);
        alerts[uid]["marker"] = new google.maps.Marker({
            map: map,
            position: markers[alerts[uid]["station"]]["pos"],
            icon: levelIcons[alerts[uid]["level"]]
        });
    }
    else {
        select.val("*ALL*");
    }
    if (alerts[uid]["level"] !== 2) {
        dom.find(".thresholdBar .choice").removeClass("selected");
        if (alerts[uid]["level"] === 1)
            dom.find(".thresholdBar .choice.action").addClass("selected");
        if (alerts[uid]["level"] === 3)
            dom.find(".thresholdBar .choice.moderate").addClass("selected");
        if (alerts[uid]["level"] === 4)
            dom.find(".thresholdBar .choice.major").addClass("selected");
    }
    select.on("input",function() {
        alerts[uid]["station"] = $(this).val();
        if (alerts[uid]["marker"])
            alerts[uid]["marker"].setMap(null);
        if (alerts[uid]["station"] !== "*ALL*")
            alerts[uid]["marker"] = new google.maps.Marker({
                map: map,
                position: markers[alerts[uid]["station"]]["pos"],
                icon: levelIcons[alerts[uid]["level"]]
            });
        updateStationDropdowns("water");
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
        if (typeof alerts[uid]["station"] !== "undefined" && alerts[uid]["station"] !== "*ALL*") {
            alerts[uid]["marker"].setIcon(levelIcons[alerts[uid]["level"]]);
        }
    });
    dom.find(".closeButton").click(function() {
        if (alerts[uid]["marker"])
            alerts[uid]["marker"].setMap(null);
        dom.remove();
        delete alerts[uid];
        updateStationDropdowns("water");
    });
    $("html, body").animate({ scrollTop: $(document).height() }, 150);
    updateStationDropdowns("water");
}

const wavesIcons = [
    null,
    {
        "url": "/map/sprites/markers/wave/moderate.svg",
        "anchor": new google.maps.Point(15, 27),
        "scaledSize": new google.maps.Size(30, 28),
    },
    {
        "url": "/map/sprites/markers/wave/major.svg",
        "anchor": new google.maps.Point(15, 27),
        "scaledSize": new google.maps.Size(30, 28),
    }
];
function addWavesAlert(stationStr, level) {
    let uid = generateUID();
    let dom = $(templateAlertBoxWaves.render());
    dom.data("uid",uid);
    chosenAlerts.append(dom);
    dom.offsetHeight; //hack to force browser to acknowledge height
    setTimeout(function() {
        dom.removeClass("hide");
    },0);
    alerts[uid] = {
        "type":"waves",
        "dom":dom,
        "level":level || 1,
        "station":stationStr || "*ALL*"
    };
    let select = dom.find(".stationSelect");
    select.append($("<option />").val("*ALL*").text("[ All Stations ]"));
    Object.values(markers).forEach(marker => {
        if (marker["hasWaves"])
            select.append($("<option />").val(marker["stationStr"]).text(marker["title"]));
    });
    if (alerts[uid]["station"] !== "*ALL*") {
        select.val(stationStr);
        alerts[uid]["marker"] = new google.maps.Marker({
            map: map,
            position: markers[alerts[uid]["station"]]["pos"],
            icon: wavesIcons[alerts[uid]["level"]]
        });
    }
    else {
        select.val("*ALL*");
    }
    if (alerts[uid]["level"] !== 1) {
        dom.find(".thresholdBar .choice").removeClass("selected");
        if (alerts[uid]["level"] === 2)
            dom.find(".thresholdBar .choice.wavesMajor").addClass("selected");
    }
    select.on("input",function() {
        alerts[uid]["station"] = $(this).val();
        if (alerts[uid]["marker"])
            alerts[uid]["marker"].setMap(null);
        if (alerts[uid]["station"] !== "*ALL*")
            alerts[uid]["marker"] = new google.maps.Marker({
                map: map,
                position: markers[alerts[uid]["station"]]["pos"],
                icon: wavesIcons[alerts[uid]["level"]]
            });
        updateStationDropdowns("waves");
    });
    dom.find(".thresholdBar .choice").click(function() {
        dom.find(".thresholdBar .choice").removeClass("selected");
        $(this).addClass("selected");
        if ($(this).hasClass("wavesAction"))
            alerts[uid]["level"] = 1;
        else if ($(this).hasClass("wavesMajor"))
            alerts[uid]["level"] = 2;
        if (typeof alerts[uid]["station"] !== "undefined" && alerts[uid]["station"] !== "") {
            alerts[uid]["marker"].setIcon(wavesIcons[alerts[uid]["level"]]);
        }
    });
    dom.find(".closeButton").click(function() {
        if (alerts[uid]["marker"])
            alerts[uid]["marker"].setMap(null);
        dom.remove();
        delete alerts[uid];
        updateStationDropdowns("waves");
    });
    $("html, body").animate({ scrollTop: $(document).height() }, 150);
    updateStationDropdowns("waves");
}


$('#submitAlertsButton').click(submit);
function submit() {
    //check contact information
    let contactValue = $('#primaryContactInput').val();
    let primaryContact = "";
    if (contactValue.match(/^\+?[0-9 -()]{3,}$/)) { //if it looks like a phone number
        if (!contactValue.includes("+"))
            primaryContact = "+1"+contactValue.replace(/[^+0-9\-]/g,"");
        else
            primaryContact = contactValue.replace(/[^+0-9\-]/g,"");
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
            "water": {},
            "waves": {}
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
        else if (alert["type"] === "water") {
            if (typeof alert["station"] === "undefined") {
                alert["dom"].addClass("error");
                $('#submitError').text("Select a station.");
                return;
            }
            else {
                alert["dom"].removeClass("error");
                alertsObject["alerts"]["water"][alert["station"]] = alert["level"];
            }
        }
        else if (alert["type"] === "waves") {
            if (typeof alert["station"] === "undefined") {
                alert["dom"].addClass("error");
                $('#submitError').text("Select a station.");
                return;
            }
            else {
                alert["dom"].removeClass("error");
                alertsObject["alerts"]["waves"][alert["station"]] = alert["level"];
            }
        }
    }
    $('#submitAlertsButton').addClass("loading");
    if (updating) {
        alertsObject["code"] = verifyCode;
        $.ajax({
            url: apiUrl + "/updateuser",
            type: 'POST',
            crossDomain: true,
            data: JSON.stringify(alertsObject),
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (xhr.status === 200) {
                    $('#primaryContactInput').prop('disabled', true);
                    $('#alertArea').addClass('hide');
                    $('#updateMessage').removeClass('hide');
                    $('#updateMessage .details').text($('#updateMessage .details').text().replace("{primary}", primaryContact));
                }
                else {
                    $('#submitError').text(data);
                    $('#submitAlertsButton').removeClass("loading");
                }
            },
            error: function (xhr) {
                $('#submitError').text(xhr.responseText || "Something went wrong. Try again later.");
                $('#submitAlertsButton').removeClass("loading");
            }
        });
    }
    else {
        $.ajax({
            url: apiUrl + "/adduser",
            type: 'POST',
            crossDomain: true,
            data: JSON.stringify(alertsObject),
            contentType: "application/json",
            success: function (data, textStatus, xhr) {
                if (xhr.status === 200) {
                    $('#primaryContactInput').prop('disabled', true);
                    $('#alertArea').addClass('hide');
                    $('#successMessage').removeClass('hide');
                    $('#successMessage .details').text($('#successMessage .details').text().replace("{primary}", primaryContact));
                }
                else {
                    $('#submitError').text(data);
                    $('#submitAlertsButton').removeClass("loading");
                }
            },
            error: function (xhr) {
                $('#submitError').text(xhr.responseText || "Something went wrong. Try again later.");
                $('#submitAlertsButton').removeClass("loading");
            }
        });
    }
}

function updateStationDropdowns(type) {
    for (let stationIndex in markers) {
        if (!markers.hasOwnProperty(stationIndex))
            continue;
        if (alertExists(type,stationIndex))
            $('.alertBox.'+type+' option[value="'+stationIndex+'"]').prop( "disabled", true);
        else
            $('.alertBox.'+type+' option[value="'+stationIndex+'"]').prop( "disabled", false);
    }
}

function alertExists(type,stationStr) {
    for (let alertIndex in alerts) {
        if (!alerts.hasOwnProperty(alertIndex))
            continue;
        let alert = alerts[alertIndex];
        if (alert["type"] === type && alert["station"] === stationStr)
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
