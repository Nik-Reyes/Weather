import WeatherData from './modules/WeatherDataService.js';
import DomManager from './modules/DomManager.js';
import './style.css';

const contentWrapper = document.querySelector('.content-wrapper');
const loaderTop = document.querySelector('.loader-top');
const loaderBottom = document.querySelector('.loader-bottom');
const form = document.querySelector('form');
const dom = new DomManager();

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
	startRevealAnimations();
	weatherData.trimDescription();
	dom.populateData({
		currentConditions: weatherData.currentConditions,
		conditionDescription: weatherData.conditionDescription,
		minTemp: weatherData.minTemp,
		maxTemp: weatherData.maxTemp,
		unit: weatherData.unit,
		timezone: weatherData.timezone,
		tenDayForecast: weatherData.getDays(10),
		nextFourtyEightHours: weatherData.getHours(2),
		timezone: weatherData.timezone,
	});
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
	populateData();
	startBlinkAnimation();
}

const weatherData = new WeatherData();
if (populateData()) {
	startBlinkAnimation();
}
form.addEventListener('submit', searchNewLocation);
setInterval(populateData, 600000); //refreshes every 10 minutes
