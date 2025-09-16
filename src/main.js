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
	loaderTop.classList.add('animate-reveal');
	loaderBottom.classList.add('animate-reveal');
	loaderBottom.addEventListener(
		'animationend',
		() => {
			loaderTop.classList.add('animate-retract');
			loaderBottom.classList.add('animate-retract');
			contentWrapper.removeAttribute('style');
			contentWrapper.classList.add('animate-constrain', 'animate-revealing');
			contentWrapper.addEventListener(
				'animationend',
				() => {
					removeAnimations();
				},
				{ once: true },
			);
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
	searchbar.blur();
	weatherData.setLocation(location);
	contentWrapper.classList.add('animate-constrain');
	if (populateData()) {
		startBlinkAnimation();
	}
}

const weatherData = new WeatherData();
if (populateData(weatherData)) {
	startBlinkAnimation();
}
form.addEventListener('submit', searchNewLocation);
setInterval(populateData, 600000); //refreshes every 10 minutes
