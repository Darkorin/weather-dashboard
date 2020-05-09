let openWeatherApiKey = "2246d60e7d75252a39377e98999b6ed4";
let recentlySearched = [];
let cityName;

let placesAutoComplete = places({
    appId: 'plLEHJSL5YWH',
    apiKey: '76dda26b95a77f06a0a8754c39e7f292',
    container: document.querySelector('#address-input')
});

const renderRecentlySearched = function () {
    $("#recent-searches").empty();
    let storedSearches = localStorage.getItem('recentlySearched');

    if (storedSearches) {
        recentlySearched = JSON.parse(storedSearches);
        for (let i = 0; i < recentlySearched.length; i++) {
            $("#recent-searches").prepend($("<button>").attr("type", "button").attr("class", "btn border btn-block btn-light").text(recentlySearched[i]));
        }
    }
}

const addToLocalStorage = function () {

    if (recentlySearched.includes(cityName)) {
        return;
    }

    if (recentlySearched.length === 10) {
        recentlySearched.shift();
    }
    recentlySearched.push(cityName);

    localStorage.setItem("recentlySearched", JSON.stringify(recentlySearched));
    renderRecentlySearched();
}

const currentWeather = function () {
    $.get(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&APPID=${openWeatherApiKey}&units=imperial`).then(function (response) {

        uvIndex(response.coord.lat, response.coord.lon);
        
        $(`#current-day-icon`).attr("src", `https://openweathermap.org/img/wn/${response.weather[0].icon}@2x.png`);
        $("#temp").text(`${response.main.temp} ${String.fromCharCode(176)}F`);
        $("#humidity").text(`${response.main.humidity}%`);
        $("#wind-speed").text(`${response.wind.speed} MPH`);
    });
}

const fivedayForecast = function () {
    $.get(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&APPID=${openWeatherApiKey}&units=imperial`).then(function (response) {
        for (let i = 0; i < 5; i++) {
            $(`#day${i}-icon`).attr("src", `https://openweathermap.org/img/wn/${response.list[i*8].weather[0].icon}@2x.png`);
            $(`#day${i}-temp`).text(`${response.list[i*8].main.temp} °F`);
            $(`#day${i}-humidity`).text(`${response.list[i*8].main.humidity}%`);
            $(`#day${i}-date`).text(checkDate(response.list[i*8]["dt_txt"], false));
        }
    });
}

const uvIndex = function (lat, lon) {
    $.get(`https://api.openweathermap.org/data/2.5/uvi?lat=${lat}&lon=${lon}&APPID=${openWeatherApiKey}&units=imperial`).then(function (response) {
        let uvi = response.value;
        let uvColor;
        let textColor;

        if (uvi < 3) {
            uvColor = "green";
            textColor = "black";
        } else if (uvi < 6) {
            uvColor = "yellow";
            textColor = "black";
        } else if (uvi < 8) {
            uvColor = "orange";
            textColor = "black";
        } else if (uvi < 11) {
            uvColor = "crimson";
            textColor = "whitesmoke";
        } else {
            uvColor = "purple";
            textColor = "whitesmoke";
        }

        $("#uv-index").text(uvi);
        $("#uv-index").attr("style", `color: ${textColor}; background-color: ${uvColor}; padding: 5px; border-radius: 5px;`);
    });
}

const checkDate = function (date, isToday) {
    let day;
    let month;
    let year;

    if (isToday) {
        day = String(date.getDate()).padStart(2, '0');
        month = String(date.getMonth() + 1).padStart(2, '0');
        year = date.getFullYear();

    } else {
        month = date.substring(5, 7);
        day = date.substring(8, 10);
        year = date.substring(0, 4);
    }

    return `${month}/${day}/${year}`;
}

const displayCurrentWeather = function () {
    addToLocalStorage();

    $(".results").fadeIn(1000);
    $(".name").text(`${cityName} (${checkDate(new Date(), true)})`);
    $("#searchLabel").attr("style", "text-align: left; margin-top: 1%");

    currentWeather();
    fivedayForecast();
}

const autoComplete = function (e) {
    cityName = e.suggestion.name;
    displayCurrentWeather();
}

const clickHandler = function (e) {
    e.preventDefault();
    cityName = $(this).text();
    displayCurrentWeather();
}

placesAutoComplete.on('change', autoComplete);
$(".clickable").on('click', 'button', clickHandler);
renderRecentlySearched();