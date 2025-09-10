import WeatherData from './modules/WeatherDataService.js';
import makeHours from './scripts/HourlyForecast/hourlyForcast.js';
import loadCurrentForcast from './scripts/CurrentForecast/currentForecast.js';
import tenDayForecast from './scripts/TenDayForecast/tenDayForecast.js';
import './style.css';

const contentWrapper = document.querySelector('.content-wrapper');
const loaderTop = document.querySelector('.loader-top');
const loaderBottom = document.querySelector('.loader-bottom');

function removeAnimations() {
	[contentWrapper, loaderTop, loaderBottom].forEach(element => {
		[...element.classList].forEach(cls => {
			if (cls.includes('animate')) {
				element.classList.remove(cls);
			}
		});
	});
}

function initializeAnimations() {
	loaderTop.classList.add('animate-explode');
	loaderBottom.classList.add('animate-explode');
	loaderBottom.addEventListener(
		'animationend',
		() => {
			loaderTop.classList.add('animate-retract');
			loaderBottom.classList.add('animate-retract');
			contentWrapper.classList.add('animate-explode');
			contentWrapper.addEventListener('animationend', removeAnimations, { once: true });
			contentWrapper.removeAttribute('style');
		},
		{ once: true },
	);
}

async function populateData() {
	await weatherData.fetchWeatherData();
	loadCurrentForcast(
		weatherData.currentConditions,
		weatherData.conditionDescription,
		weatherData.minTemp,
		weatherData.maxTemp,
		weatherData.unit,
	);
	makeHours(weatherData.getHours(2)); // accepts days as param
	tenDayForecast(weatherData.getDays(10));
	initializeAnimations();
}

// ask weather data service to get the weather data
const weatherData = new WeatherData();
if (populateData()) {
	loaderTop.classList.add('animate-blink');
	loaderBottom.classList.add('animate-blink');
}
setInterval(populateData, 900000);
