// Function to autocomplete dropdown list based on user input
$(function autoFill() {
    const getUrl = window.location;
    const baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split("/")[1];

    $(".autocomplete").autocomplete({
        source: function (request, response) {
            // Hide the recent searches which are contained in the scroll container
            $("#scroll_container").hide();
            $("#route_options").hide();

            // Show the output of the autocomplete search in the form output which is hidden by default
            $("#form_output").show();

            // Retrieve data from the database
            $.ajax({
                url: baseUrl + "autocomplete_stop/",
                data: {
                    term: request.term,
                },
                success: function (data) {
                    response(
                        $.map(data, function (value) {
                            return {
                                label: value.stop_name,
                                value: value.stop_name,
                                text: value.coordinates,
                            };
                        })
                    );
                },
            });
        },

        minLength: 2,

        focus: function (event, ui) {
            return false;
        },

        select: function (event, ui) {
            $(event.target).text(ui.item.text);
        },

        // Append the output to div with an ID of form_output instead of the body
        appendTo: "#form_output",
        position: { my: "left top", at: "left top", of: "#form_output" },

        // Place other options here if required
    });
});
