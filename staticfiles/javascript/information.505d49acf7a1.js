$(document).ready(function () {
    window.weatherWidgetConfig = window.weatherWidgetConfig || [];
    window.weatherWidgetConfig.push({
        selector: ".weatherWidget",
        apiKey: "PUBLIC_WIDGET_KEY", //lots of usage? Sign up for your personal key
        location: "Dublin, Ireland", //enter an addres
        unitGroup: "metric", //"us" or "metric"
        forecastDays: 5, //how many days forecast to show
        title: "Dublin, Ireland", //optional title to show in the
        showTitle: true,
        showConditions: true,
    });

    (function () {
        var d = document,
            s = d.createElement("script");
        s.src = "https://www.visualcrossing.com/widgets/forecast-simple/weather-forecast-widget-simple.js";
        s.setAttribute("data-timestamp", +new Date());
        (d.head || d.body).appendChild(s);
    })();
});
