// Hide the date and time forms by default
$(document).ready(function () {
    $("#timepicker").hide();
    $("#datepicker").hide();
});

//==============================================================
// Function to submit form data on button click
$(document).ready(function () {
    $("#route_select").click(function (event) {
        // prevent the refreshing of the page
        event.preventDefault();
        let myData = getFormData();

        if (myData == null) {
            return;
        }

        // Location coordinate strings will only be present if stops
        // are properly selected from the autocomplete lists
        // Alert the user and return from the function if
        // there are no locations to avoid the history array being populated with unusable data
        if (myData.source_location == "" || myData.destination_location == "") {
            alert("Please select valid source and destination stops.");
            return;
        }

        // save myData to history to list and save to local
        let history = [];

        //obtain the history & parse the favourites JSON data
        let local_history = JSON.parse(localStorage.getItem("history"));

        if (local_history) {
            if (local_history.length <= 10) {
                // Add the new route if history under 10
                local_history.push(myData);
                localStorage.setItem("history", JSON.stringify(local_history));
            } else {
                // Remove the oldest route add new route
                local_history.pop();
                local_history.push(myData);
                localStorage.setItem("history", JSON.stringify(local_history));
            }
        } else {
            history.push(myData);
            localStorage.setItem("history", JSON.stringify(history));
        }
        // Pass the bus_routes to the fetch_data function
        fetch_data(myData);
    });
});

//==============================================================
$(document).ready(function () {
    $("#switch_directions").click(function (event) {
        event.preventDefault();

        // Get the value and text from the form fields
        let source_val = $("#id_source").val();
        let source_txt = $("#id_source").text();
        let destination_val = $("#id_destination").val();
        let destination_txt = $("#id_destination").text();

        // Check to see if values have been inputted
        if (source_val && destination_val) {
            $("#id_source").val(destination_val);
            $("#id_source").text(destination_txt);
            $("#id_destination").val(source_val);
            $("#id_destination").text(source_txt);

            // Trigger the route selection button
            $("#route_select").trigger("click");
        }
    });
});

//==============================================================
$(document).ready(function () {
    $("#show_datetime").click(function (event) {
        event.preventDefault();

        //Hide and show the date and time forms
        $("#timepicker").toggle();
        $("#datepicker").toggle();
    });
});

//==============================================================
// function to refresh the page when user clicks on search
$(document).ready(function () {
    $("#search_routes").click(function () {
        location.reload();
    });
});

//==============================================================
// Execute plan route by clicking Enter button
$(document).on("keypress", function (e) {
    let source_val = $("#id_source").val();
    let destination_val = $("#id_destination").val();
    let active = $("#search_routes").attr("class");

    if (active === "tab active" && e.which === 13 && source_val !== "" && destination_val !== "") {
        // Trigger the route selection button
        $("#route_select").trigger("click");
    }
});

//==============================================================
//function to retrieve form data
function getFormData() {
    // Location coordinate strings will only be present if stops
    // are properly selected from the autocomplete lists
    // Alert the user and return from the function if
    // there are no locations to avoid the history array being populated with unusable data
    if ($("#id_source").text() == "" || $("#id_destination").text() == "") {
        alert("Please select valid source and destination stops.");
        return;
    }

    //Obtain values from Form
    let source_name = $("#id_source").val();
    let destination_name = $("#id_destination").val();

    // Create a dictionary to store the form data in history
    if (source_name !== "" && destination_name !== "") {
        // Create a dictionary to be passed as the POST body
        let myData = {
            source_name: source_name,
            source_location: $("#id_source").text(),
            destination_name: destination_name,
            destination_location: $("#id_destination").text(),
            date: $("#datepicker").val(),
            time: $("#timepicker").val(),
        };
        return myData;
    } else {
        alert("Please select source and destination.");
    }
}

//Search by voice
$(document).ready(() => {
    $(".voice").on("click", function (event) {
        event.preventDefault();

        // Get the form to be filled
        let text_box = $(this).prev();

        // set the values for the voice recognition
        var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
        var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;

        // obtain the grammar set
        var grammar = "#JSGF V1.0;";

        var recognition = new SpeechRecognition();
        var speechRecognitionList = new SpeechGrammarList();
        speechRecognitionList.addFromString(grammar, 1);

        // Set the configurations for the speech recognition software
        recognition.grammars = speechRecognitionList;
        recognition.lang = "en-US";
        recognition.interimResults = false;

        // Obtain the result from the voice recognition
        recognition.onresult = function (event) {
            var last = event.results.length - 1;
            var command = event.results[last][0].transcript;

            // Search the database using the command
            text_box.autocomplete("search", command);
        };
        // function to stop recording
        recognition.onspeechend = function () {
            recognition.stop();
        };

        // alert the user if an error occurred in voice recognition
        recognition.onerror = function (event) {
            alert("Error occurred in recognition: " + event.error);
        };

        // Once everything is configured start recording
        recognition.start();
    });
});
