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
            if (sideBarWidth == 0 && bodyWidth > 270) {
                document.getElementById("sidebar").style.width = "100%";
                document.getElementById("checkbox_label").setAttribute("aria-label", "Close sidebar");
            } else if (sideBarWidth == 0 && bodyWidth <= 270) {
                document.getElementById("sidebar").style.width = "270px";
                document.getElementById("checkbox_label").setAttribute("aria-label", "Close sidebar");
            } else {
                document.body.classList.add("nowrap");
                document.getElementById("sidebar").removeAttribute("style");
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
