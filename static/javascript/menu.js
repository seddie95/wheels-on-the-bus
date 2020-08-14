// Function to ccordinate the opening and closing of the sidebar and the modals
$(document).ready(function () {
    var enterKeyCode = 13;
    var spaceKeyCode = 32;
    $("#checkbox_label").on("click keyup", function (event) {
        if (event.type == "click" || event.keyCode == enterKeyCode || event.keyCode == spaceKeyCode) {
            document.getElementById("checkbox").checked = true;
            var element = document.getElementById("sidebar");
            var positionInfo = element.getBoundingClientRect();
            var sideBarWidth = positionInfo.width;
            if (sideBarWidth == 0) {
                document.getElementById("sidebar_content").style.width = document.body.clientWidth + "px";
                document.getElementById("directions_modal_content").style.width = document.body.clientWidth + "px";
                document.getElementById("stops_modal_content").style.width = document.body.clientWidth + "px";

                document.getElementById("sidebar").style.width = "100%";
                document.getElementById("stops_modal").style.width = "100%";
                document.getElementById("directions_modal").style.width = "100%";
                document.getElementById("checkbox_label").setAttribute("aria-label", "Close sidebar");
            } else {
                document.getElementById("sidebar_content").style.width = document.body.clientWidth + "px";
                document.getElementById("directions_modal_content").style.width = document.body.clientWidth + "px";
                document.getElementById("stops_modal_content").style.width = document.body.clientWidth + "px";
                document.getElementById("sidebar").style.width = "0px";
                document.getElementById("stops_modal").style.width = "0px";
                document.getElementById("directions_modal").style.width = "0px";
                document.getElementById("checkbox").checked = false;
                document.getElementById("checkbox_label").setAttribute("aria-label", "Open sidebar");
            }
            document.getElementById("checkbox").disabled = true;
            setTimeout(function () {
                document.getElementById("checkbox").disabled = false;
            }, 500);
        }
    });
});

$(document).ready(function () {
    if (document.getElementById("sidebar_content").style.width != "100%") {
        window.addEventListener("resize", function () {
            document.getElementById("sidebar_content").style.width = "100%";
            document.getElementById("directions_modal_content").style.width = "100%";
            document.getElementById("stops_modal_content").style.width = "100%";
        });
    }
});
