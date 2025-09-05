import './style.css';
import WeatherData from './modules/WeatherDataService.js';

import makeHours from './scripts/HourlyForecast/hourlyForcast.js';
import loadCurrentForcast from './scripts/CurrentForecast/currentForecast.js';
import tenDayForecast from './scripts/TenDayForecast/tenDayForecast.js';

const pageWrapper = document.querySelector('.page-wrapper');

// ask weather data service to get the weather data
const weatherData = new WeatherData();
new Promise(resolve => {
	resolve(weatherData.fetchWeatherData());
}).then(() => {
	loadCurrentForcast(weatherData.currentConditions, weatherData.conditionDescription);
	makeHours(weatherData.getHours(2)); // accepts days as param
	tenDayForecast(weatherData.getDays(10));
	pageWrapper.removeAttribute('style');
});
