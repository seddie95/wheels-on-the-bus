var image_dict = {
    Clear: "/static//images/weather/Sun.png",
    Clouds: "/static//images/weather/Cloud.png",
    Rain: "/static//images/weather/Rain.png",
    Snow: "/static//images/weather/Snow.png",
    Thunderstorm: "/static//images/weather/Storm.png",
    fog: "/static//images/weather/Haze.png",
    Mist: "/static//images/weather/Haze.png",
    Smoke: "/static//images/weather/Haze.png",
    Haze: "/static//images/weather/Haze.png",
    Dust: "/static//images/weather/Haze.png",
    Fog: "/static//images/weather/Haze.png",
    Sand: "/static//images/weather/Haze.png",
    Ash: "/static//images/weather/Haze.png",
    Squall: "/static//images/weather/Haze.png",
};

//function to display the current weather on the map
$(document).ready(function () {
    let url = "http://api.openweathermap.org/data/2.5/weather?q=dublin&appid=9da3d1abfb8e1a3677d26c96350597c3&units=metric";
    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (obj) {
            let temperature = obj.main.temp;
            let description = obj.weather[0].main;
            // console.log(temperature, description);

            // if (description in image_dict) {
            //     document.getElementById("weatherIcon").src = image_dict[description];
            // }
            // // if the weather type is not available display clouds by default
            // else {
            //     document.getElementById("weatherIcon").src = image_dict.Clouds;
            // }
        })
        .catch(function (error) {
            console.log("Difficulty fetching weather data: ", error);
        });
});
