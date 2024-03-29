// Get the base URL

// function to display all of the routes
$(document).ready(function () {
    $("#load_routes").click(function (event) {
        event.preventDefault();

        // Hide the bus polyline if it exists
        if (directionsRenderer) {
            deleteMarkers();
            directionsRenderer.setMap(null);
        }

        if (polylines) {
            deletePolylines();
        }

        // Check to see if a cached version of the routes exist
        let parsed_data;
        try {
            parsed_data = JSON.parse(localStorage.getItem('routes'));

        } catch (e) {
            console.log(e);
        }

        if (parsed_data) {
            displayRouteList(parsed_data)
        } else {
            //create url with form data
            const URL = baseUrl + "routes/";

            fetch(URL)
                .then(function (response) {
                    return response.json();
                })
                .then(function (obj) {
                    // add the returned json response to local storage for future usage
                    localStorage.setItem("routes", JSON.stringify(obj));

                    // display the routes in a list
                    displayRouteList(obj)

                })
                .catch(function (error) {
                    console.error("Difficulty fetching routes data:", error);
                });
        }
    });
});

// function to select all the stops  along a chosen route

var enterKeyCode = 13;
$(document).on("click keyup", "#route_click li", function (event) {
    if (event.type == "click" || event.keyCode == enterKeyCode) {
        event.preventDefault();

        // Remove the already existing markers
        if (markers) {
            deleteMarkers();
        }

        let line_id = $(this).attr("id");

        var directionId;
        if ($("#direction_button").val() == "") {
            directionId = "Inbound";
        } else {
            directionId = $("#direction_button").val();
        }

        // Get the route id and direction
        let route_info = {
            line_id: line_id,
            direction: directionId,
        };

        // Check if cached version of the stops along the route exist
        let Line_direction = `${line_id}${directionId}`;
        let parsed_data;
        try {
            parsed_data = JSON.parse(localStorage.getItem(Line_direction));

        } catch (e) {
            console.log(e);
        }

        if (parsed_data) {
            displayStops(parsed_data, route_info)
        } else {
            const csrf = $("input[name='csrfmiddlewaretoken']").val();
            const URL = baseUrl + "stops/";

            //Pass the data to the server
            fetch(URL, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(route_info),
                cache: "no-cache",
                headers: new Headers({
                    "X-CSRFToken": csrf,
                    Accept: "application/json",
                    "content-type": "application/json",
                }),
            })
                .then(function (response) {
                    return response.json();
                    // use the static data to create dictionary
                })
                .then(function (obj) {
                    // add the returned json response to local storage for future usage
                    localStorage.setItem(Line_direction, JSON.stringify(obj));

                    displayStops(obj, route_info)
                })

                // catch used to test if something went wrong when parsing or in the network
                .catch(function (error) {
                    console.error("Difficulty fetching stops data:", error);
                });
        }
    }
});

//Function narrow down the search for a bus route
$(document).ready(function () {
    $("#route_search").bind("keyup click change", function () {
        //Event on input
        let search = $(this).val().toLowerCase(); //Turns input val lowercase
        let re = new RegExp(search, "g");

        $("#route_click li").each(function () {
            //Search in all <li>
            $(this).hide(); //Hide all <li>
            let target = $(this).text().toLowerCase(); //Turns <li> text lowercase
            if (target.match(re)) {
                $(this).show(); //Show <li> with matching letter/word
            }
        });
    });
});

// function to change the direction of the route
$(document).ready(function () {
    $("#direction_button").click(function (event) {
        event.preventDefault();

        if ($(this).text() === gettext("Inbound")) {
            $(this).text(gettext("Outbound"));
            $(this).val("Outbound");

            // Swap the start and end stops on change from Inbound to Outbound route selection
            $(".line_wrap").text(function (i, content) {
                values = content.trim().split(" - ");
                let start = values[1];
                let end = values[0];

                document.getElementsByClassName("route_text_start")[i].innerHTML = start + " - ";
                document.getElementsByClassName("route_text_end")[i].innerHTML = end;
            });
        } else {
            $(this).text(gettext("Inbound"));
            $(this).val("Inbound");

            // Swap the end and start stops on change from Inbound to Outbound route selection
            $(".line_wrap").text(function (i, content) {
                values = content.trim().split(" - ");
                let start = values[1];
                let end = values[0];

                document.getElementsByClassName("route_text_start")[i].innerHTML = start + " - ";
                document.getElementsByClassName("route_text_end")[i].innerHTML = end;
            });
        }
    });
});


function displayRouteList(routes_data) {
    //create an unordered list in html
    let routes_list = "<ul id='route_click'>";

    // Display the routes in html list
    for (let i = 0; i < routes_data.length; i++) {
        let head = routes_data[i]["headsign"].split(" - ");
        let route_id = routes_data[i]["route_id"];
        let start = head[0];
        let end = head[1];

        // Add the route info to route_list
        routes_list += `<li tabindex='0' id='${route_id}' data-dialog='stops_modal'><span class="transport_container">
                    <img src='/static/images/bus.svg' id='bus_icon'>${route_id}
                    </span><div class="line_wrap">
                    <span class="route_text_start">${start} - </span>
                    <span class="route_text_end">${end}</span><div/></li>`;
    }
    routes_list += `</ul>`;
    $("#routes_list").html(routes_list);
}


function displayStops(obj, route_info) {

    obj.forEach(displayMarkers);

    // Display route on map
    displayRoutes(obj);

    // Zoom to the markers
    zoomMarkers();

    // display the object in a modal
    displayStopsModal(obj, route_info);

    // Display the infowindow by clicking on the list item
    $("#stops_list li").click(function () {
        let index = $(this).index();
        new google.maps.event.trigger(markers[index], "click");
    });
}

