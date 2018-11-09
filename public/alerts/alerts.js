map = new google.maps.Map(document.getElementById('map'), {
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
    else if ($(this).val().match(/^.*@.*\..*/)) { //if it looks like an email
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