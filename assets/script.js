function run() {
  var cityEL = document.getElementById('enter-city');
  var clearEl = document.getElementById('clear-history');
  var searchEl = document.getElementById('search-button');
  var nameEl = document.getElementById('city-name');
  var pictureEl = document.getElementById('current-picture');
  var temperatureEl = document.getElementById('temperature');
  var humidityEl = document.getElementById('humidity');
  var windEl = document.getElementById('wind-speed');
  var uvEl = document.getElementById('UV-index');
  var historyEl = document.getElementById('history');
  var fivedayEl = document.getElementById('fiveday-header');
  var currentWeather = document.getElementById('today-weather');
  var searchHistory = JSON.parse(localStorage.getItem('seach')) || [];

  const APIKey = '9086b2695e50446e8d6b40b443ffef73';

  function searchWeather(cityName) {
    var queryURL =
      'https://api.openweathermap.org/data/2.5/weather?q=' +
      cityName +
      '&appid=' +
      APIKey;
    axios.get(queryURL).then(function (response) {
      currentWeather.classList.remove('d-none');

      const currentDate = new Date(response.data.dt * 1000);
      const day = currentDate.getDate();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      nameEl.innerHTML =
        response.data.name + '(' + month + '/' + day + '/' + year + ')';
      var weatherPicture = response.data.weather[0].icon;
      pictureEl.setAttribute(
        'src',
        'https://openweathermap.org/img/wn/' + weatherPicture + '@2x.png'
      );
      pictureEl.setAttribute('alt', response.data.weather[0].description);
      temperatureEl.innerHTML =
        'Temperature:' + fahrenheitConvert(response.data.main.tem) + ' &#176F';
      humidityEl.innerHTML = 'Humidity:' + response.data.main.humidity + '%';
      windEl.innerHTML = 'Wind Speed' + response.data.wind.speed + 'MPH';

      var lat = response.data.coord.lat;
      var lon = response.data.coord.lon;
      var uvQueryURL = `https://api.openweathermap.org/data/2.5/uvi/forecast?lat=${lat}&lon=${lon}&appid=${APIKey}&cnt=1`;

      axios.get(uvQueryURL).then(function (response) {
        var uvIndex = document.createElement('span');

        if (response.data[0].value < 4) {
          uvIndex.setAttribute('class', 'badge badge-success');
        } else if (response.data[0].value < 8) {
          uvIndex.setAttribute('class', 'badge badge-warning');
        } else {
          uvIndex.setAttribute('class', 'badge badge-danger');
        }
        uvIndex.innerHTML = response.data[0].value;
        uvEl.innerHTML = 'UV Index';
        uvEl.append(uvIndex);
      });

      var cityId = response.data.id;
      var forcastQueryURL = `https://api.openweathermap.org/data/2.5/forecast?id=${cityId}&appid=${APIKey}`;

      axios.get(forcastQueryURL).then(function (response) {
        fivedayEl.classList.remove('d-none');

        const forecastEls = document.querySelectorAll('.forecast');

        for (let i = 0; i < forecastEls.length; i++) {
          forecastEls[i].innerHTML = '';
          const forecastIndex = i * 8 + 4;
          const forecastDate = new Date(
            response.data.list[forecastIndex].dt * 1000
          );
          const forecastDay = forecastDate.getDate();
          const forecastMonth = forecastDate.getMonth() + 1;
          const forecastYear = forecastDate.getFullYear();
          const forecastDateEl = document.createElement('p');
          forecastDateEl.setAttribute('claas', 'mt-3 mb-0 forecast-date');
          forecastDateEl.innerHTML = `${forecastMonth}/${forecastDay}/${forecastYear}`;
          forecastEls[i].append(forecastDateEl);

          const forecastWeatherEl = document.createElement('img');
          forecastWeatherEl.setAttribute(
            'src',
            `https://openweathermap.org/img/wn/${response.data.list[forecastIndex].weather[0].icon}@2x.png`
          );
          forecastWeatherEl.setAttribute(
            'alt',
            response.data.list[forecastIndex].weather[0].description
          );
          forecastEls[i].append(forecastWeatherEl);
          const forecastTemperatureEl = document.createElement('p');
          forecastTemperatureEl.innerHTML = `Temp: ${fahrenheitConvert(
            response.data.list[forecastIndex].main.temp
          )} &#176F`;
          forecastEls[i].append(forecastTemperatureEl);
          const forecastHumidityEl = document.createElement('p');
          forecastHumidityEl.innerHTML = `Humidity: ${response.data.list[forecastIndex].main.humidity}%`;
          forecastEls[i].append(forecastHumidityEl);
        }
      });
    });
  }
  searchEl.addEventListener('click', function () {
    const searchInput = cityEL.value;
    searchWeather(searchInput);
    searchHistory.push(searchInput);
    localStorage.setItem('search', JSON.stringify(searchHistory));
    showSearchHistory();
  });

  clearEl.addEventListener('click', function () {
    localStorage.clear();
    searchHistory = [];
    showSearchHistory();
  });

  function fahrenheitConvert(K) {
    return Math.floor((K - 273.15) * 1.8 + 32);
  }

  function showSearchHistory() {
    historyEl.innerHTML = '';
    for (let i = 0; i < searchHistory.length; i++) {
      const historyItem = document.createElement('input');
      historyItem.setAttribute('type', 'text');
      historyItem.setAttribute('readonly', 'true');
      historyItem.setAttribute('class', 'form-control d-block bg-white');
      historyItem.setAttribute('value', searchHistory[i]);
      historyItem.addEventListener('click', function () {
        searchWeather(historyItem.value);
      });
      historyEl.append(historyItem);
    }
  }
  showSearchHistory();
  if (searchHistory.length > 0) {
    searchWeather(searchHistory[searchHistory.length - 1]);
  }
}

run();
