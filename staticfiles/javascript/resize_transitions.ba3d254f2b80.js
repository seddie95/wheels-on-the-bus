//  Prevents tranisitions occuring when the window is being resized
let timer;
window.addEventListener("resize", function () {
    document.body.classList.add("resize_standard");
    clearTimeout(timer);
    timer = setTimeout(function () {
        document.body.classList.remove("resize_standard");
    }, 400);
});
