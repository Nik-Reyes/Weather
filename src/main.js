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
	console.log(weatherData);

	loadCurrentForcast(
		weatherData.currentConditions,
		weatherData.conditionDescription,
		weatherData.minTemp,
		weatherData.maxTemp,
		weatherData.unit,
	);
	makeHours(weatherData.getHours(2)); // accepts days as param
	tenDayForecast(weatherData.getDays(10));
	pageWrapper.removeAttribute('style');
});
