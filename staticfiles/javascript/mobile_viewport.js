$(document).ready(function () {
    // Let the viewport unit = 1% of the window inner height
    let vh = window.innerHeight * 0.01;

    // Make this variable available as a CSS variable.
    document.documentElement.style.setProperty("--vh", `${vh}px`);

    var resizeTimer;

    // Check when the window is resized
    $(window).on("resize", function (e) {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            // Run code here, resizing has "stopped"
            // Update the vh variable
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty("--vh", `${vh}px`);
        }, 250);
    });
});
