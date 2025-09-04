import './style.css';
import makeHours from './scripts/HourlyForecast/hourlyForcast.js';
import circularReadout from './scripts/CircularReadout/circularReadout.js';
import loadCurrentForcast from './scripts/CurrentForecast/currentForecast.js';
import tenDayForecast from './scripts/TenDayForecast/tenDayForecast.js';

// circularReadout();
const pageWrapper = document.querySelector('.page-wrapper');

//ask weather data service to get the weather data
// import WeatherData from './modules/WeatherDataService.js';
// const weatherData = new WeatherData();
// await weatherData.fetchWeatherData();
// console.log(weatherData.rawData);

// create hourly forecast
makeHours();
