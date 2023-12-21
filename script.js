const APIKey = "d7c7dd490bd06dec4a36038a9785767b";

const today = $("#today");
const forecast = $("#forecast");
const historyDiv = $("#history");
const searchBtn = $("#search-button");
let history = [];

// Getting the current day and format it
const currentDay = dayjs();
const showDate = dayjs().format("D/MM/YYYY");

$(document).ready(function () {
  getHistory();
  showHistoryButtons();
});

searchBtn.on("click", function (event) {
  $("#today").empty();
  $("#forecast").empty();
  event.preventDefault();

  

    const todayCard = $("<div>").addClass("card rounded bg-warning");

  // Storing the searched value in a variable
  let cityName = $("#search-input").val();


  if (!localStorage.getItem("history")) {
    localStorage.setItem("history", JSON.stringify([]));
  }

  // Checking for duplicate values
  if (!history.includes(cityName.toLowerCase())) {
    // add the city to the history
    history.push(cityName);
    localStorage.setItem("history", JSON.stringify(history));
    showHistoryButtons();
  }

  

  // Creates a Fetch call for the specific city when clicked search Button
  const queryURL = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${APIKey}`;

  fetch(queryURL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
      // Storing lan and lon so I can use them later for the forecast fetch request
      const lat = Number(data.coord.lat.toFixed(2));
      const lon = Number(data.coord.lon.toFixed(2));

      // Displaying an icon with the weather condition
      const iconPng = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
      const icon = $("<img>")
        .attr("src", iconPng)
        .attr("alt", data.weather[0].main);

      // Display city name, date
      const cityAndDate = $("<h3>").text(` ${data.name}  (${showDate})`);
      cityAndDate.append(icon);
      todayCard.append(cityAndDate);

      // Getting the temperature, wind, humidity, and the icon and creating p tags
      const todayCardBody = $("<div>").addClass("card-body");
      const tempC = (data.main.temp - 273.15).toFixed(2);
      const temp = $("<p>").text("Temperature " + tempC);
      const wind = $("<p>").text("Wind Speed: " + data.wind.speed);
      const humidity = $("<p>").text("Humidity: " + data.main.humidity);

      // Append elements to the card
      todayCardBody.append(temp, wind, humidity);
      todayCard.append(todayCardBody);
      today.append(todayCard);

      // Create a Fetch call for the forecast using latitude and longitude
      const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}`;
      fetch(forecastURL)
        .then(function (response) {
          return response.json();
        })
        .then(function (forecastData) {
          const forecastList = forecastData.list;

          //Looping 5 time to show 5 days forecast
          for (let i = 1; i < 6; i++) {
            const forecastDay = currentDay.add(i, "day");

            const forecast5Days = forecastList.find((day) =>
              dayjs(day.dt_txt).isSame(forecastDay, "day")
            );

            // Formatting the forecast date
            const forecastDayFormatted = forecastDay.format("DD/MM/YYYY");

            const card = $("<div>").addClass("col-md-2 mb-3");
            const cardBody = $("<div>").addClass(
              "card-body rounded card-body text-center bg-warning"
            );
            const forecastDate = $("<h5>")
              .addClass("card-title")
              .text(forecastDayFormatted);

            // Getting the temperature, wind, humidity, and the icon and p tags
            const tempC = (forecast5Days.main.temp - 273.15).toFixed(2);
            const windSpeed = forecast5Days.wind.speed;
            const humidity = forecast5Days.main.humidity;
            const iconPng = `https://openweathermap.org/img/wn/${forecast5Days.weather[0].icon}@2x.png`;
            const temp = $("<p>")
              .addClass("card-text small")
              .text(`Temperature: ${tempC}°C`);
            const wind = $("<p>")
              .addClass("card-text small")
              .text(`Wind Speed: ${windSpeed} m/s`);
            const humidityInfo = $("<p>")
              .addClass("card-text small")
              .text(`Humidity: ${humidity}%`);
            const forecastIcon = $("<img>")
              .addClass("card-img-top")
              .attr("src", iconPng)
              .attr("alt", forecast5Days.weather[0].main);

            // Append elements to the card
            cardBody.append(
              forecastDate,
              forecastIcon,
              temp,
              wind,
              humidityInfo
            );
            card.append(cardBody);

            // Append the card to the forecast container
            $("#forecast").append(card);
          }
        });
    });
});

// Function to get search history from local storage
function getHistory() {
  if ("history" in localStorage) {
    history = JSON.parse(localStorage.getItem("history"));
  } else {
    history = [];
  }
}

// Function to display search history buttons
function showHistoryButtons() {
  historyDiv.empty();
  history.forEach((city) => {
    const historyBtn = $("<button>")
      .text(city.toUpperCase())
      .addClass("btn btn-secondary m-1")
      .attr("data-name", city);
    historyBtn.on("click", function () {
      const cityName = $(this).attr("data-name");
      $("#search-input").val(cityName);
      $("#search-button").trigger("click");
    });
    historyDiv.prepend(historyBtn);
  });
}

// click functionality for the clear history button
$("#clear-button").on("click", function (event) {
    event.preventDefault();
    localStorage.clear();
    $("#history").empty();
  });