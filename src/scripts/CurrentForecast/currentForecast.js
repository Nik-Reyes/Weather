import './current-forecast.css';
import circularReadout from '../CircularReadout/circularReadout.js';
import { formatInTimeZone } from 'date-fns-tz';

export default function loadCurrentForcast(currentConditions, conditionDescription, minTemp, maxTemp, unit, timezone) {
	const currentCondtionDict = {
		conditions: condition => {
			const weatherState = document.querySelector('.weather-state.title');
			weatherState.textContent = condition;
		},
		feelslike: feelsLikeTemp => {
			const feelsLike = document.querySelector('.feels-like-temp');
			feelsLike.textContent = `${feelsLikeTemp}°`;
		},
		humidity: currHumidity => {
			const circularElement = document.querySelector('.progressbar.humidity');
			const maxHumidity = 100;
			circularReadout(circularElement, maxHumidity, currHumidity);
		},
		icon: () => {},
		precipprob: precipProb => {
			const circularElement = document.querySelector('.progressbar.precipitation');
			const maxPrecipProb = 100;
			circularReadout(circularElement, maxPrecipProb, precipProb);
		},
		temp: currTemp => {
			const currentTemp = document.querySelector('.current-forecast-temp');
			currentTemp.textContent = `${currTemp}°${unit === 'us' ? 'F' : 'C'}`;
		},
		uvindex: UVIndex => {
			const circularElement = document.querySelector('.progressbar.uv-index');
			const maxUVIndex = 12;
			circularReadout(circularElement, maxUVIndex, UVIndex);
		},
	};

	for (let [weatherElement, value] of Object.entries(currentConditions)) {
		if (Object.hasOwn(currentCondtionDict, weatherElement)) {
			if (!isNaN(value)) value = parseInt(value);
			currentCondtionDict[weatherElement](value);
		}
	}

	const description = document.querySelector('.weather-condition-blocks .weather-description');
	const minTempEl = document.querySelector('.low-temp-reading');
	const maxTempEl = document.querySelector('.high-temp-reading');
	const currentTime = document.querySelector('.current-time');

	currentTime.textContent = formatInTimeZone(new Date(), timezone, 'h:mmaaa');
	let time = setInterval(() => {
		const time = formatInTimeZone(new Date(), timezone, 'h:mmaaa');
		currentTime.textContent = time;
	}, 1000);

	console.log(time);
	minTempEl.textContent = `${minTemp}°`;
	maxTempEl.textContent = `${maxTemp}°`;
	description.textContent = conditionDescription;
}
