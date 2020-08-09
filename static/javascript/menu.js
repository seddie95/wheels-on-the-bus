$(document).ready(function () {
    var enterKeyCode = 13;
    var spaceKeyCode = 32;
    $("#checkbox_label").on("click keyup", function (event) {
        if (event.type == "click" || event.keyCode == enterKeyCode || event.keyCode == spaceKeyCode) {
            document.getElementById("checkbox").checked = true;
            var bodyWidth = document.body.clientWidth;
            var element = document.getElementById("sidebar");
            var positionInfo = element.getBoundingClientRect();
            var sideBarWidth = positionInfo.width;
            if (sideBarWidth == 0) {
                document.getElementById("sidebar_content").style.width = document.body.clientWidth + "px";
                setTimeout(function () {
                    document.getElementById("sidebar_content").style.width = "100%";
                }, 400);
                document.getElementById("sidebar").style.width = "100%";
                document.getElementById("stops_modal").style.width = "100%";

                document.getElementById("checkbox_label").setAttribute("aria-label", "Close sidebar");
            } else {
                document.getElementById("sidebar_content").style.width = document.body.clientWidth + "px";
                document.getElementById("sidebar").removeAttribute("style");
                document.getElementById("stops_modal").style.width = "0px";
                document.getElementById("directions_modal").style.width = "0px";
                document.getElementById("checkbox").checked = false;
                document.getElementById("checkbox_label").setAttribute("aria-label", "Open sidebar");
            }
            document.getElementById("checkbox").disabled = true;
            setTimeout(function () {
                document.getElementById("checkbox").disabled = false;
            }, 400);
        }
    });
});
