function displayDirectionsModal(bus_data, index, addresses) {
    try {
        let data = bus_data[index];
        let start = addresses[0];
        let end = addresses[1];

        // Get the directions_modal
        var modal = document.getElementById("directions_modal");

        // Get the span element that enables the modal to be closed
        var span = document.getElementsByClassName("close")[0];

        // The modal is displayed as block
        var side_bar = document.getElementById("sidebar");
        modal.style.width = side_bar.offsetWidth + "px";
        modal.style.display = "block";

        // Set a short timeout function to ensure that the modal is displayed before it is focused on.
        setTimeout(function () {
            modal.focus();
        }, 300);

        // The modal is closed when the x button is clicked
        span.onclick = function () {
            modal.style.display = "none";
        };

        // The modal is closed when the screen is clicked anywhere outside of the modal
        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        };

        window.addEventListener("keydown", function (e) {
            if (e.keyCode === 27) {
                modal.style.display = "none";
            }
        });

        let weather_icon = displayWeather(data[1].description);

        // Data is
        var text = `<div id='weather_data' tabindex = "0">
            <img id='weather_icon' src='${weather_icon}'>
            <span id='centered'>${data[0].temperature}°c</span>
            </div>`;

        text += gettext(`<h3 tabindex = "0">${start}:</h3>`) + "<ul id='journey_info'tabindex = '0'>";

        for (let i = 0; i < data.length; i++) {
            var travel_mode = data[i].travel_mode;

            if (travel_mode === "WALKING") {
                let duration = data[i].duration;
                let distance = data[i].distance;
                text += gettext("<li><strong>Walk</strong><br> About ") + `${distance} • ${duration}</li>`;
            }

            if (travel_mode === "TRANSIT") {
                let line_id = data[i].line_id;
                let stop_id = data[i].departure_stop_id;

                if (Number.isInteger(parseInt(stop_id))) {
                    let bus_times = [];
                    // Get the real time arrival times for the stops
                    fetch(baseUrl + "rtpi/", {
                        method: "POST",
                        credentials: "include",
                        body: JSON.stringify(stop_id),
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
                        .then(function (obj) {
                            let buses = obj.results;

                            buses.forEach(function (bus) {
                                let route = bus.route;

                                if (route === line_id && bus_times.length < 3) {
                                    bus_times.push(" " + bus.duetime);
                                }
                            });

                            $(`#arrival_${stop_id}`).html(`<br>Leaves in: <strong>${bus_times.toString()} min</strong>`);
                        })
                        .catch(function (error) {
                            console.error("Difficulty fetching real time arrival data:", error);
                        });
                }

                text +=
                    "<li>" +
                    gettext("<strong>Depart from:</strong> ") +
                    "<br>" +
                    data[i].start_name +
                    "<br>" +
                    "<br>" +
                    gettext("lineid: ") +
                    gettext(line_id) +
                    "<br>" +
                    "<br>" +
                    gettext("Departs at: ") +
                    getTime(data, i) +
                    `<div id='arrival_${stop_id}'></div>` +
                    "<br>" +
                    gettext(" Arrives to: ") +
                    "<br>" +
                    data[i].end_name +
                    "<br>" +
                    "<br>" +
                    gettext("Stops: ") +
                    data[i].num_stops +
                    " • " +
                    data[i].travel_time +
                    " mins <span id='arrow'>&#9660</span>" +
                    "<div id='directions_stops_list'>";
                let stop_list = "<ul>";

                for (let j = 0; j < data[i].stops.length; j++) {
                    stop_list += "<li>" + data[i].stops[j] + "</li>";
                }

                stop_list += "</ul>";
                text += stop_list + "</div>" + "</li>";
            }
        }
        text += "<li>" + "</li>";
        text += "</ul>" + "<h3 tabindex = '0'>" + end + "</h3>";

        $("#directions_list").html(text);
    } catch (error) {
        console.error("Difficulty fetching directions modal data:", error);
    }
}

//========================================================================
function displayStopsModal(obj, route_info) {
    try {
        // Get the stops_modal
        var stops_modal = document.getElementById("stops_modal");

        // Get the span element that enables the modal to be closed
        var stops_span = document.getElementsByClassName("close")[1];

        // The modal is displayed as block
        var side_bar = document.getElementById("sidebar");
        stops_modal.style.width = side_bar.offsetWidth + "px";
        stops_modal.style.display = "block";

        stops_modal.focus();

        // The modal is closed when the x button is clicked
        stops_span.onclick = function () {
            stops_modal.style.display = "none";
        };

        // The modal is closed when the screen is clicked anywhere outside of the modal
        window.onclick = function (event) {
            if (event.target === stops_modal) {
                stops_modal.style.display = "none";
            }
        };

        window.addEventListener("keydown", function (e) {
            if (e.keyCode === 27) {
                stops_modal.style.display = "none";
            }
        });

        let line_id = route_info["line_id"];

        let route_selected = `<li id='${line_id}' tabindex="0"><span class="transport_container">
        <img src='/static/images/bus.svg' id='bus_icon'>${line_id}</span>
        <span class="route_text"></span></li>`;

        $("#route_selected").html(route_selected);

        //Create an unordered list in html
        let stops_list = "<ul id='stop_click'>";

        let stop_data = obj;

        // Display the stops in html list
        for (let i = 0; i < stop_data.length; i++) {
            let stop_name = stop_data[i]["stop_name"];

            stops_list += "<li tabindex=0>" + stop_name + "</li>";
        }
        stops_list += "</ul>";
        $("#stops_list").html(stops_list);
    } catch (error) {
        console.error("Difficulty fetching stops modal data:", error);
    }
}

//========================================================================
// function to get time from timestamp
function getTime(data, i) {
    let date = new Date(data[i].departure_timestamp * 1000);
    let minutes = "0" + date.getMinutes();
    return date.getHours() + ":" + minutes.substr(-2);
}

//function to show and hide the stops div
$(document).on("click", "#journey_info li", function (event) {
    event.preventDefault();
    $("div", this).toggle();

    // // change the triangle direction
    if ($("#arrow", this).text() === "▼") {
        $("#arrow", this).text("▲");
    } else {
        $("#arrow", this).text("▼");
    }
});

//========================================================================
//function to display the current weather on the map
function displayWeather(description) {
    //dictionary to store weather icons
    let image_dict = {
        Clear: "/static/images/weather/Sun.png",
        Clouds: "/static/images/weather/Cloud.png",
        Rain: "/static/images/weather/Rain.png",
        Snow: "/static/images/weather/Snow.png",
        Thunderstorm: "/static/images/weather/Storm.png",
        fog: "/static/images/weather/Haze.png",
        Mist: "/static/images/weather/Haze.png",
        Smoke: "/static/images/weather/Haze.png",
        Haze: "/static/images/weather/Haze.png",
        Dust: "/static/images/weather/Haze.png",
        Fog: "/static/images/weather/Haze.png",
        Sand: "/static/images/weather/Haze.png",
        Ash: "/static/images/weather/Haze.png",
        Squall: "/static/images/weather/Haze.png",
    };

    return description in image_dict ? image_dict[description] : image_dict.Clouds;
}

//========================================================================

// Function to display the languages selction modal
$(document).ready(function () {
    // Get the modal
    var languages_modal = document.getElementById("languages_modal");

    // Get the button that opens the modal
    var languages_button = document.getElementById("languages_button");

    // Get the <span> element that closes the modal
    var languages_span = document.getElementsByClassName("close")[2];

    // When the user clicks on the button, open the modal
    languages_button.onclick = function () {
        var header = document.getElementById("header");
        languages_modal.style.width = header.offsetWidth + "px";
        languages_modal.style.display = "block";
    };

    // When the user clicks on <span> (x), close the modal
    languages_span.onclick = function () {
        languages_modal.style.display = "none";
    };

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function (event) {
        if (event.target === languages_modal) {
            languages_modal.style.display = "none";
        }
    };
});

window.onresize = function () {
    var stops_modal = document.getElementById("stops_modal");
    var directions_modal = document.getElementById("directions_modal");
    var languages_modal = document.getElementById("languages_modal");

    var header = document.getElementById("header");

    stops_modal.style.width = header.offsetWidth + "px";
    directions_modal.style.width = header.offsetWidth + "px";
    languages_modal.style.width = header.offsetWidth + "px";
};
