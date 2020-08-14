// Add the current time to the timepicker field and update every minute
// while the page is not reloaded

$(document).ready(function () {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();

    // Call the check 0 function in case there are 0s in the number
    h = checkForZero(h);
    m = checkForZero(m);
    document.getElementById("timepicker").value = h + ":" + m;

    function checkForZero(i) {
        var length = i.toString().length;
        if (i < 10 && length < 2) {
            i = "0" + i;
        }
        return i;
    }
});

$(document).ready(function () {
    let today = new Date().toISOString().substr(0, 10);
    document.querySelector("#datepicker").value = today;

    let min = today;
    document.querySelector("#datepicker").min = min;

    let get_max = new Date();
    get_max.setDate(get_max.getDate() + 5);
    let max = get_max.toISOString().substr(0, 10);
    document.querySelector("#datepicker").max = max;
});

// Function to select the time
// $(document).ready(function () {
//     $("#timepicker").flatpickr({
//         enableTime: true,
//         noCalendar: true,
//         time_24hr: true,
//         dateFormat: "H:i",
//         defaultDate: new Date(),
//         // disableMobile: "true",
//     });
// });

// Function to select the date
// $(document).ready(function () {
//     $("#datepicker").flatpickr({
//         defaultDate: "today",
//         minDate: "today",
//         maxDate: new Date().fp_incr(5),
//         // disableMobile: "true",
//     });
// });
