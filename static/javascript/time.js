// Add the current time to the timepicker field and update every minute
// while the page is not reloaded

$(document).ready(function () {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();

    // Call the check 0 function in case there are 0s in the number
    h = checkZero(h);
    m = checkZero(m);
    document.getElementById("timepicker").value = h + ":" + m;

    function checkZero(i) {
        var length = i.toString().length;
        if (i < 10 && length < 2) {
            i = "0" + i;
        }
        return i;
    }
});

$(document).ready(function () {
    document.getElementById("datepicker").value = new Date().toISOString().substr(0, 1);
    datepicker.min = new Date().toISOString().split("T")[0];
    test = new Date();
    test.setDate(test.getDate() + 5);
    datepicker.max = test.toISOString().split("T")[0];
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
