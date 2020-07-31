// Get the base URL
const getUrl = window.location;
const baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split("/")[1];

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

        //create url with form data
        const URL = baseUrl + "routes/";

        fetch(URL)
            .then(function (response) {
                return response.json();
            })
            .then(function (obj) {
                let routes_data = obj;

                //create an unordered list in html
                let routes_list = "<ul id='route_click'>";

                // Display the routes in html list
                for (let i = 0; i < routes_data.length; i++) {
                    let head = routes_data[i]["headsign"].split(" - ");
                    let route_id = routes_data[i]["route_id"];
                    let start = head[0];
                    let end = head[1];

                    // Add the route info to route_list
                    routes_list += `<li id='${route_id}'><span class="transport_container">
                                    <img src='/static/images/bus.svg/' id='bus_icon'>${route_id}</span>
                                    <div class="line_wrap"><span class="route_text">${start} - </span><span class="route_text">${end}</span><div/></li>`;
                }
                routes_list += `</ul>`;
                $("#routes_list").html(routes_list);
            })
            .catch(function (error) {
                console.error("Difficulty fetching routes data:", error);
            });
    });
});

// function to select all the stops  along a chosen route
$(document).on("click", "#route_click li", function (event) {
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

    //    console.log("route_info: ",route_info);

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
            // display the markers on the map
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
        })

        // catch used to test if something went wrong when parsing or in the network
        .catch(function (error) {
            console.error("Difficulty fetching stops data:", error);
        });
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
            let target = $(this).text().toLowerCase(); //Tuns <li> text lowercase
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
        } else {
            $(this).text(gettext("Inbound"));
            $(this).val("Inbound");
        }
    });
});
