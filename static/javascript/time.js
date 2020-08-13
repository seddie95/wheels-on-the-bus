// Function to select the time from a dropdown
// $(document).ready(function () {
//     $("#timepicker").flatpickr({
//         enableTime: true,
//         noCalendar: true,
//         time_24hr: true,
//         dateFormat: "H:i",
//         defaultDate: new Date(),
//         disableMobile: "true",
//     });
// });

// Function to select the date from a dropdown
// $(document).ready(function () {
//     $("#datepicker").flatpickr({
//         defaultDate: "today",
//         minDate: "today",
//         maxDate: new Date().fp_incr(5),
//         disableMobile: "true",
//     });
// });

$(document).ready(function () {
    $("#timepicker").pickatime();
});

$(document).ready(function () {
    $("#datepicker").pickadate();
});
