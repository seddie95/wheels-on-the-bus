// Map variable
var map;
var bounds;
var placeIdArray = [];
var polylines = [];
var snappedCoordinates = [];
var pos;

// Array to store marker variables
var markers = [];

// Rendering variables
var directionsService;
var directionsRenderer;

//add infowindow
var infowindow;

// Creation of map
function initMap() {
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer();
    infowindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 53.349804, lng: -6.26031 },
        zoom: 12.0,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
        controlSize: 25,
    });
}

//=================================================================================================
// Delete markers from map
function deleteMarkers() {
    markers.forEach((marker) => marker.setMap(null));
    markers = [];
}

//=================================================================================================
// Delete polylines from map
function deletePolylines() {
    polylines.forEach((line) => line.setMap(null));
}

//=================================================================================================
// Zoom in on the route markers
function zoomMarkers() {
    bounds = new google.maps.LatLngBounds();
    for (let i = 0; i < markers.length; i++) {
        bounds.extend(markers[i].getPosition());
    }
    map.fitBounds(bounds);
}

//=================================================================================================

// Function to change the selected route
function changeRoute(i) {
    directionsRenderer.setRouteIndex(i);
    directionsRenderer.setMap(map);
}

//=================================================================================================

// Post Form data to backend and retrieve response
function fetch_data(myData) {
    // If the markers array contains any markers they are deleted
    if (markers.length > 0) {
        deleteMarkers();
    }

    if (infowindow) {
        infowindow.close();
    }

    if (polylines) {
        deletePolylines();
    }

    // Get the date time string
    const dateTime = myData.date + " " + myData.time;

    // The source marker is created
    var start = JSON.parse(myData.source_location);
    var sourceLatlng = new google.maps.LatLng(start[0], start[1]);
    var sourceMarker = new google.maps.Marker({
        position: sourceLatlng,
        map: map,
    });

    // The destination marker is created
    var end = JSON.parse(myData.destination_location);
    var destinationLatlng = new google.maps.LatLng(end[0], end[1]);
    var destinationMarker = new google.maps.Marker({
        position: destinationLatlng,
        map: map,
    });

    // The source and destination markers are added to the markers array
    markers.push(sourceMarker, destinationMarker);
    markers.forEach((marker) => marker.setMap(map));

    // Zoom in on the route markers
    zoomMarkers();

    //create the request for the directions
    let request = {
        origin: sourceLatlng,
        destination: destinationLatlng,
        travelMode: "TRANSIT",
        provideRouteAlternatives: true,
        transitOptions: {
            departureTime: new Date(dateTime),
        },
    };

    // Pass request to google directions service
    directionsService.route(request, function (response, status) {
        if (status == "OK") {
            // array to store the bus times and locations
            var travel_outer = [];

            // String used to create list of stops

            title = "<h2 tabindex = '0' aria-label='Search Results List. Select a list item for full details.'>Search Results</h2>";

            let route_option = title;

            route_option += `<ul id='routeList'>`;
            const routes = response["routes"];

            for (let i = 0; i < routes.length; i++) {
                try {
                    var departure_name;
                    let unnamed = true;
                    var travel_inner = [];
                    let leg = routes[i]["legs"][0];
                    let leg_step = leg["steps"];
                    let start_address = leg["start_address"];
                    let end_address = leg["end_address"];
                    var addresses = [start_address, end_address];
                    var timestamp;
                    if (!("departure_time" in leg)) {
                        continue;
                    } else {
                        timestamp = new Date(leg["departure_time"]["value"]).getTime() / 1000;
                    }

                    // console.log(timestamp);
                    route_option += `<li><a href='#' id='routeIndex'>`;

                    for (let j = 0; j < leg_step.length; j++) {
                        // walking variables
                        let duration = leg_step[j]["duration"]["text"];
                        let distance = leg_step[j]["distance"]["text"];
                        let travel_mode = leg_step[j]["travel_mode"];

                        let travel_dict = {
                            duration: duration,
                            distance: distance,
                            travel_mode: travel_mode,
                            timestamp: timestamp,
                        };

                        // Add the travel times and durations for walking the travel array
                        if (travel_mode === "WALKING") {
                            travel_inner.push(travel_dict);
                        }

                        try {
                            // Variables to store conditional data
                            let line_id;
                            let travel_time;
                            let icon;
                            let border_id;

                            // Parsed google directions details
                            let transit_details = leg_step[j]["transit"];
                            let agency = transit_details["line"]["agencies"][0]["name"];
                            let dept_stop_name = transit_details["departure_stop"]["name"];
                            let num_stops = transit_details["num_stops"];
                            let arr_stop_name = transit_details["arrival_stop"]["name"];
                            let arr_stop_loc = transit_details["arrival_stop"]["location"];
                            let dept_stop_loc = transit_details["departure_stop"]["location"];

                            // obtain the date and time
                            let departure_time = new Date(transit_details["departure_time"]["value"]).getTime() / 1000;

                            // Set the travel time if not possible to model
                            if (agency !== "Dublin Bus") {
                                line_id = transit_details["line"]["name"];
                                let arrival = new Date(transit_details["arrival_time"]["value"]).getTime() / 1000;
                                travel_time = Math.round((arrival - departure_time) / 60);
                            }

                            // Set the icon and border colour based on agency

                            switch (agency) {
                                case "Luas":
                                    icon = "/static/images/luas.png";
                                    border_id = "luas";
                                    break;
                                case "Irish Rail":
                                    icon = "/static/images/dart.svg";
                                    border_id = "rail";
                                    break;
                                default:
                                    icon = "/static/images/bus.svg";
                                    let lowercase_line_id = transit_details["line"]["short_name"];
                                    line_id = lowercase_line_id.toUpperCase();
                            }

                            // Set Dublin Area Rapid Transport to Dart
                            if (line_id === "Dublin Area Rapid Transit") {
                                line_id = "Dart";
                            }

                            // set the departure name to be the first stop name
                            if (dept_stop_name && unnamed) {
                                departure_name = dept_stop_name;
                                unnamed = false;
                            }

                            // Create dictionary for each mode of transport on route
                            let bus_dict = {
                                travel_mode: travel_mode,
                                duration: duration,
                                distance: distance,
                                line_id: line_id,
                                agency: agency,
                                timestamp: timestamp,
                                departure_name: dept_stop_name,
                                departure_location: dept_stop_loc,
                                arrival_name: arr_stop_name,
                                arrival_location: arr_stop_loc,
                                num_stops: num_stops,
                                travel_time: travel_time,
                            };

                            // Push the dictionaries to the travel_inner array
                            travel_inner.push(bus_dict);

                            //add routes icon and border colour
                            route_option +=
                                `<span class="transport_container" id=${border_id}>
                                <img src=${icon} id='bus_icon' alt="transport mode icon"> ` +
                                line_id +
                                "</span>";

                            // Ignore any errors
                        } catch (e) {}
                    }
                } catch (e) {}
                // Append the data required for the backend
                travel_outer.push(travel_inner);

                // Add the Departure name
                route_option += `<br/>${departure_name}</a></li>`;
            }

            // Hide the form output div so that the route options div can be shown properly
            $("#form_output").hide();

            // // Show the route options div so that the route option list can be inserted into the HTML
            // let route_options_div = $("#route_options");
            // route_options_div.show();
            // route_option += "</li>";

            // //Set the contents of the div to be equal to the route_options_div
            // route_options_div.html(route_option);

            // // Pass the directions to be Rendered the first option
            // directionsRenderer.setDirections(response);
            // directionsRenderer.setMap(map);

            // Pass the google maps data to the server

            // document.getElementById("route_options").innerHTML = "<h1>hello</h1>";
            // var hello = document.getElementById("route_options");
            // console.log(hello);

            // $('id_sourece').keypress(function(e) {
            //     e.preventDefault();
            // });

            // Do not allow new inputs while a search is being performed
            // The input fields are blurred out
            $("#id_source").focus(function (e) {
                $(this).blur();
            });
            $("#id_destination").focus(function (e) {
                $(this).blur();
            });

            // Show the loader before the fetch call is made
            $("#search_tab_loader").show();

            //create url with form data
            const URL = baseUrl + "predict/";

            fetch(URL, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(travel_outer),
                cache: "no-cache",
                headers: new Headers({
                    "X-CSRFToken": getCsrf(),
                    Accept: "application/json",
                    "content-type": "application/json",
                }),
            })
                .then(function (response) {
                    return response.json();
                    // use the static data to create dictionary
                })

                .then(function (obj) {
                    // Hide the loader before the results are displayed
                    $("#search_tab_loader").hide();

                    // Show the route options div so that the route option list can be inserted into the HTML
                    let route_options_div = $("#route_options");
                    route_options_div.show();
                    route_option += "</li>";

                    //Set the contents of the div to be equal to the route_options_div
                    route_options_div.html(route_option);

                    // Allow the input fields to be refocused
                    $("#id_destination").focus(function (e) {
                        $(this).focus();
                    });
                    $("#id_source").focus(function (e) {
                        $(this).focus();
                    });

                    // Pass the directions to be Rendered the first option
                    directionsRenderer.setDirections(response);
                    directionsRenderer.setMap(map);
                    // The bus_data array and the index of the li clicked are passed
                    var enterKeyCode = 13;
                    $(document).on("click keyup", "#route_options li", function (event) {
                        if (event.type == "click" || event.keyCode == enterKeyCode) {
                            let index = $(this).index();

                            // Change the route on the map
                            changeRoute(index);

                            // Display the modal for the route
                            displayDirectionsModal(obj, index, addresses);
                        }
                    });
                })

                // catch used to test if something went wrong when parsing or in the network
                .catch(function (error) {
                    console.error("Difficulty fetching prediction data:", error);
                    alert("Error: Difficulty fetching prediction data.");
                    $("#search_tab_loader").hide();

                    // Allow the input fields to be refocused.
                    $("#id_destination").focus(function (e) {
                        $(this).focus();
                    });
                    $("#id_source").focus(function (e) {
                        $(this).focus();
                    });
                });
        } else {
            console.log("Error");
        }
    });
}

//Function to display the stops along the route on google maps
//=================================================================================================
function displayRoutes(route_dict) {
    // remove existing polylines
    if (polylines) {
        deletePolylines();
    }

    // Create path for google snap to road
    let path_values = "";
    route_dict.forEach((route) => {
        path_values += `${route.coordinates.lat},${route.coordinates.lng}|`;
    });

    // Get the google snap to road response passing the coordinates as path
    $.get(
        "https://roads.googleapis.com/v1/snapToRoads",
        {
            interpolate: true,
            key: "AIzaSyCWB44JbOMcoIFA15MhD1Mxv2v7Q4_mZmg",
            path: path_values.slice(0, -1),
        },
        function (data) {
            processSnapToRoadResponse(data);
            drawSnappedPolyline();
        }
    );

    // Store snapped polyline returned by the snap-to-road service.
    function processSnapToRoadResponse(data) {
        snappedCoordinates = [];
        placeIdArray = [];
        for (let i = 0; i < data.snappedPoints.length; i++) {
            let latlng = new google.maps.LatLng(data.snappedPoints[i].location.latitude, data.snappedPoints[i].location.longitude);
            snappedCoordinates.push(latlng);
            placeIdArray.push(data.snappedPoints[i].placeId);
        }
    }

    // Draws the snapped polyline (after processing snap-to-road response).
    function drawSnappedPolyline() {
        let snappedPolyline = new google.maps.Polyline({
            path: snappedCoordinates,
            strokeColor: "#7094cf",
            strokeWeight: 6,
            strokeOpacity: 0.9,
        });

        snappedPolyline.setMap(map);
        polylines.push(snappedPolyline);
    }
}

//Function to obtain the users Geolocation if requested
//=================================================================================================

function geoLocation() {
    let title = "Your location";
    let icon = "/static/images/location.png";

    // Remove the already existing markers
    if (markers) {
        deleteMarkers();
    }
    if (polylines) {
        deletePolylines();
    }

    // hide the route options
    $("#route_options").hide();

    // Attempt to obtain Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                let marker = createMarker(pos, title, icon);
                markers.push(marker);

                // Get the nearest stops to the user
                displayNearestStops(pos);
            },
            function () {
                handleLocationError(true, infowindow, map.getCenter());
            }
        );
    } else {
        // If Geolocation is not supported by the browser
        handleLocationError(false, infowindow, map.getCenter());
    }

    function handleLocationError(browserHasGeolocation, infoWindow, pos) {
        infowindow.setPosition(pos);
        var bodyWidth = document.body.clientWidth;
        if (bodyWidth > 600) {
            infowindow.setContent(browserHasGeolocation ? "Error: Geolocation has failed." : "Error: Your browser does not support Geolocation sercices.");
            infowindow.open(map);
            setTimeout(function () {
                infowindow.close();
            }, 3000);
            setTimeout(function () {
                infowindow.setContent("");
            }, 3000);
        } else {
            alert(browserHasGeolocation ? "Error: Geolocation has failed." : "Error: Your browser does not support Geolocation sercices.");
        }
    }
}

// Geolocation button
$(document).ready(function () {
    let locationButton = document.getElementById("location_button");
    locationButton.addEventListener("click", function () {
        geoLocation();
    });
});

//===============================================================
//function To display the nearest stops to user
function displayNearestStops(pos) {
    fetch(baseUrl + "closest/", {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(pos),
        cache: "no-cache",
        headers: new Headers({
            "X-CSRFToken": getCsrf(),
            Accept: "application/json",
            "content-type": "application/json",
        }),
    })
        .then(function (response) {
            return response.json();
            // use the static data to create dictionary
        })
        .then(function (obj) {
            obj.forEach(displayMarkers);
            zoomMarkers();
        })
        // catch used to test if something went wrong when parsing or in the network
        .catch(function (error) {
            console.error("Difficulty fetching nearest stops:", error);
            //alert("Difficulty retrieving prediction, please try again later. ");
        });
}

//===============================================================
// function to display marker from a list
function displayMarkers(stops) {
    let coordinates = stops.coordinates;
    let title = stops.stop_name;
    let stop_id = stops.stop_id;
    let icon = "/static/images/circle.svg";

    // create a marker for the traffic incidents
    let marker = createMarker(coordinates, title, icon);

    // add markers to list of markers
    markers.push(marker);

    google.maps.event.addListener(marker, "click", function (message) {
        if (infowindow) {
            infowindow.close();
        }

        // Get the RTPI data for the stop id
        fetch(baseUrl + "rtpi/", {
            method: "POST",
            credentials: "include",
            body: JSON.stringify(stops.stop_id),
            cache: "no-cache",
            headers: new Headers({
                "X-CSRFToken": getCsrf(),
                Accept: "application/json",
                "content-type": "application/json",
            }),
        })
            .then(function (response) {
                return response.json();
            })
            .then(function (data) {
                let buses = data.results;
                let bus_list = `<ul class='info_window_list' style="padding-inline-start: 0px;">`;
                // parse the bus data and add it to a ul

                // Get the first 5 buses from the RTPI data
                for (let i = 0; i < buses.length && i < 5; i++) {
                    let bus = buses[i];

                    bus_list += `<li ><span class="transport_container">
                                <img src='/static/images/bus.svg' id='bus_icon'> 
                                ${bus.route}</span>
                                ${bus.destination}<span id="arrival_time">${bus.duetime}`;

                    // change text depending on number of minutes
                    if (bus.duetime > 1) {
                        bus_list += `mins`;
                    } else if (bus.duetime == 1) {
                        bus_list += `min`;
                    }

                    bus_list += `</span></li>`;
                }

                bus_list += "</ul>";

                // Set the content including the RTPI data

                if (window.innerWidth > 600) {
                    infowindow.setContent(`<div class="infowindow" id="info_${stop_id}">
                    <h2 style='padding-right: 12px;'>${title}</h2> ${bus_list}</div>
                    <a id="walk" href="#" >Get walking route </a>`);
                } else if (window.innerWidth <= 600) {
                    infowindow.setContent(`<div class="infowindow" id="info_${stop_id}">
                    <h4  style='padding-right: 8px; 'margin-bottom: 8px;'>${title}</h4> ${bus_list}</div>
                    <a id="walk" href="#" >Get walking route </a>`);
                }

                //display walking route to selected stop
                $("#walk").click(function (event) {
                    event.preventDefault();
                    calculateAndDisplayRoute(pos, marker);
                });
            })
            .catch(function (error) {
                console.error("Difficulty fetching real time arrival data:", error);
            });

        infowindow.open(map, marker);
    });
}

//==============================================================
// function to create a marker
function createMarker(pos, title, icon) {
    return new google.maps.Marker({
        position: new google.maps.LatLng(pos),
        map: map,
        title: title,
        icon: {
            url: icon,
        },
    });
}

//-----------------------------------------------------------
//function to calculate the route between user and marker
function calculateAndDisplayRoute(pos, marker) {
    // check to see if user location is define otherwise use the default value

    directionsService.route(
        {
            origin: pos,
            destination: marker.position,
            travelMode: "WALKING",
        },
        function (response, status) {
            if (status === "OK") {
                // obtain the distance and duration data from the object
                let duration = response.routes[0].legs[0].duration.text;
                let distance = response.routes[0].legs[0].distance.text;

                // calculate the C02 emission prevented
                let c02 = 118 * parseFloat(distance).toFixed(4).toString();

                // display the polyline response on the map
                directionsRenderer.setDirections(response);
                directionsRenderer.setMap(map);

                // close the main infowindows
                infowindow.close();

                infowindow.setContent(
                    `Walking Duration: ${duration}<br> 
                     Walking Distance: ${distance}<br>
                     C0<sub>2</sub> Prevented: ${c02}g`
                );
                infowindow.setPosition(response.routes[0].legs[0].steps[1].end_location);
                infowindow.open(map);
            } else {
                window.alert("Directions request failed due to " + status);
            }
        }
    );
}
