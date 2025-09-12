import WeatherData from './modules/WeatherDataService.js';
import makeHours from './scripts/HourlyForecast/hourlyForcast.js';
import loadCurrentForcast from './scripts/CurrentForecast/currentForecast.js';
import tenDayForecast from './scripts/TenDayForecast/tenDayForecast.js';
import './style.css';

const contentWrapper = document.querySelector('.content-wrapper');
const loaderTop = document.querySelector('.loader-top');
const loaderBottom = document.querySelector('.loader-bottom');
const form = document.querySelector('form');

function removeAnimations() {
	[contentWrapper, loaderTop, loaderBottom].forEach(element => {
		[...element.classList].forEach(cls => {
			if (cls.includes('animate')) {
				element.classList.remove(cls);
			}
		});
	});
}

function startRevealAnimations() {
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

function startBlinkAnimation() {
	loaderTop.classList.add('animate-blink');
	loaderBottom.classList.add('animate-blink');
}

async function populateData() {
	await weatherData.fetchWeatherData();
	console.log(weatherData.timezone);

	weatherData.trimDescription();
	loadCurrentForcast(
		weatherData.currentConditions,
		weatherData.conditionDescription,
		weatherData.minTemp,
		weatherData.maxTemp,
		weatherData.unit,
		weatherData.timezone,
	);
	makeHours(weatherData.getHours(2), weatherData.timezone); // accepts days as param
	tenDayForecast(weatherData.getDays(10));
	startRevealAnimations();
}

function searchNewLocation(e) {
	e.preventDefault();
	const searchbar = e.target[0];
	const formData = new FormData(e.target);
	const location = formData.get('location');
	searchbar.value = location;
	weatherData.setLocation(location);
	if (populateData()) {
		startBlinkAnimation();
		contentWrapper.classList.add('animate-downsize');
	}
}

// ask weather data service to get the weather data
const weatherData = new WeatherData();
if (populateData()) {
	startBlinkAnimation();
}
setInterval(populateData, 900000);

form.addEventListener('submit', searchNewLocation);
