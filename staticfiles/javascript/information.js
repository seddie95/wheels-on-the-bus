$(document).ready(function myFunction() {
    window.weatherWidgetConfig = window.weatherWidgetConfig || [];
    window.weatherWidgetConfig.push({
        selector: ".weatherWidget",
        apiKey: "PUBLIC_WIDGET_KEY",
        location: "Dublin, Ireland", // Address
        unitGroup: "metric", //"us" or "metric"
        forecastDays: 5, //days forecast to show
        title: "Dublin, Ireland", //title to show
        showTitle: true,
        showConditions: true,
    });

    (function myFunction() {
        var d = document,
            s = d.createElement("script");
        s.src = "https://www.visualcrossing.com/widgets/forecast-simple/weather-forecast-widget-simple.js";
        s.setAttribute("data-timestamp", +new Date());
        (d.head || d.body).appendChild(s);
    })();
});
