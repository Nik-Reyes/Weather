import './style.css';
import WeatherData from './modules/WeatherDataService.js';

import makeHours from './scripts/HourlyForecast/hourlyForcast.js';
import circularReadout from './scripts/CircularReadout/circularReadout.js';
import loadCurrentForcast from './scripts/CurrentForecast/currentForecast.js';
import tenDayForecast from './scripts/TenDayForecast/tenDayForecast.js';

// circularReadout();
const pageWrapper = document.querySelector('.page-wrapper');

// ask weather data service to get the weather data
const weatherData = new WeatherData();
await weatherData.fetchWeatherData(); //weatherData is the data-populated obj

// create hourly forecast
makeHours(weatherData.getDays(2));
