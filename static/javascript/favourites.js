// Store the users favourite stops
$(document).ready(function () {
    $("#favourites").click(function () {
        // Source and destination coordinate strings will only be present if stops
        // are properly selected from the autocomplete lists
        // Alert the user and return from the function if there
        // are no locations to avoid the favourites array being corrupted with unusable data
        let source = $("#id_source");
        let destination = $("#id_destination");

        if (source.text() === "" || destination.text() === "") {
            alert("Please select valid source and destination stops.");
            return;
        }

        // empty list to store all of the favourites
        let favourites = [];

        // Get current date and time
        let currentDate = getDate();
        let date = currentDate.date;
        let time = currentDate.time;

        // Add values to dictionary if not empty
        if (source.val() !== "" && destination.val() !== "") {
            // Create favourite dictionary
            let favourite = {
                source_name: source.val(),
                source_location: source.text(),
                destination_name: destination.val(),
                destination_location: destination.text(),
                date: date,
                time: time,
            };

            // Get get the local data and add new favourites
            let local_favourites = JSON.parse(localStorage.getItem("favourites"));

            // check if route already in local_storage
            if (local_favourites) {
                // Add item to favourites if it is unique
                Array.prototype.inArray = function (comparer) {
                    for (let i = 0; i < this.length; i++) {
                        if (comparer(this[i])) return true;
                    }
                    return false;
                };

                Array.prototype.pushIfNotExist = function (element, comparer) {
                    if (!this.inArray(comparer)) {
                        this.push(element);
                    }
                };

                local_favourites.pushIfNotExist(favourite, function (e) {
                    return e.source_name === favourite.source_name && e.destination_name === favourite.destination_name;
                });

                localStorage.setItem("favourites", JSON.stringify(local_favourites));
            } else {
                favourites.push(favourite);
                localStorage.setItem("favourites", JSON.stringify(favourites));
            }

            // Alert user to fill in form
        } else {
            alert(gettext("Please select source and destination."));
        }
    });
});

//=======================================================================================
// Load the users favourite route
$(document).ready(function () {
    $("#load_favourites").click(function () {
        let favourites = load_local_storage("favourites");
        let favourites_list = $("#favourites_list");

        if (favourites) {
            favourites_list.html(favourites);
        } else {
            favourites_list.html(gettext("You have no favourites saved!"));
            favourites_list.css({ padding: "20px 0px 0px 20px" });
        }
    });
});
//=======================================================================================
// Load the users recent routes
$(document).ready(function () {
    let history = load_local_storage("history");
    let recent = $("#recent");

    if (history) {
        recent.html(history);
    } else {
        recent.html(gettext("You have no recent searches!"));
        recent.css({ padding: "20px 0px 0px 20px" });
    }
});

//=======================================================================================
// Load the users recent if focus is returned to the input fields
$(document).ready(function () {
    $("#id_source").focus(function () {
        let history = load_local_storage("history");

        if (history) {
            $("#recent").html(history);
        } else {
            $("#recent").html(gettext("You have no recent searches!"));
            $("#recent").css({ padding: "20px 0px 0px 20px" });
        }
        // }
    });
});

$(document).ready(function () {
    $("#id_destination").focus(function () {
        let history = load_local_storage("history");

        if (history) {
            $("#recent").html(history);
        } else {
            $("#recent").html(gettext("You have no recent searches!"));
            $("#recent").css({ padding: "20px 0px 0px 20px" });
        }
        // }
    });
});

//==============================================================================
// Function to load the contents of local storage
function load_local_storage(item) {
    let title;
    if (item === "history") {
        title = "<h2 tabindex = '0' aria-label='Recent Searches List. Select a list item to search'>Recent Searches</h2>";
    } else if (item === "favourites") {
        title = "";
    }

    // Get current date and time
    let currentDate = getDate();
    let date = currentDate.date;
    let time = currentDate.time;

    let parsed_data = JSON.parse(localStorage.getItem(item));

    if (parsed_data) {
        // create string to hold unordered list html
        let parsed_list = title + "<ul>";

        // loop backwards through the favourites and add them to the unordered list
        for (let i = parsed_data.length - 1; i >= 0; i--) {
            // Obtain the source & destination id + name
            let parsed_item = parsed_data[i];

            // Assign the stop names to variables to give more options for displaying the list
            let source_name_only = parsed_item.source_name.split(", stop")[0];
            let destination_name_only = parsed_item.destination_name.split(", stop")[0];

            // Assign the stop ids to variable to give more options for displaying the list
            let source_id_only = parsed_item.source_name.split(", stop")[1];
            let destination_id_only = parsed_item.destination_name.split(", stop")[1];

            // Apostrophes are replaced with the associated ASCII code to avoid errors in the function calls
            let source_name = parsed_item.source_name.replace(/[\/\(\)\']/g, "&#39;");
            let destination_name = parsed_item.destination_name.replace(/[\/\(\)\']/g, "&#39;");

            let parsed_dict = {
                source_name: source_name,
                source_location: parsed_item.source_location,
                destination_name: destination_name,
                destination_location: parsed_item.destination_location,
                date: date,
                time: time,
            };

            // Add the names and id's to the unordered list
            parsed_list +=
                "<li> " +
                "<a href='#' onclick='loadSearchTab(" +
                JSON.stringify(parsed_dict) +
                "); fetch_data(" +
                JSON.stringify(parsed_dict) +
                ")'>" +
                source_name_only +
                ", " +
                gettext("stop ") +
                source_id_only +
                "  -  " +
                "<br/>" +
                destination_name_only +
                ", " +
                gettext("stop ") +
                destination_id_only +
                "</a></li>";
        }
        // close off the list
        parsed_list += "</ul>";
        return parsed_list;
    }
}
// Obtain the current date to add to all of the local storage entries
function getDate() {
    let now = new Date();
    // padStart is used to make sure that day and month is always returned as two digits
    let day = String(now.getDate()).padStart(2, "0");
    let month = String(now.getMonth() + 1).padStart(2, "0");
    let year = now.getFullYear();
    let date = year + "-" + month + "-" + day;
    let minutes = String(now.getMinutes()).padStart(2, "0");
    let hours = String(now.getHours()).padStart(2, "0");
    let time = hours + ":" + minutes;

    return { date: date, time: time };
}
