import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import '../stylesheets/ten-day-forecast.css';
import '../stylesheets/current-forecast.css';
import '../stylesheets/circular-readout.css';

export default class DomManager {
	constructor() {
		this.elements = {};
		this.queryElements({
			dates: { selector: '.ten-day-forecast .ten-day-card-title', all: true },
			lows: { selector: '.ten-day-forecast .ten-day-low', all: true },
			highs: { selector: '.ten-day-forecast .ten-day-high', all: true },
			forecastDescription: { selector: '.weather-condition-blocks .weather-description', all: false },
			minTemp: { selector: '.low-temp-reading', all: false },
			maxTemp: { selector: '.high-temp-reading', all: false },
			currentTime: { selector: '.current-time', all: false },
			weatherState: { selector: '.weather-state.title', all: false },
			feelsLike: { selector: '.feels-like-temp', all: false },
			humidity: { selector: '.progressbar.humidity', all: false },
			precipitation: { selector: '.progressbar.precipitation', all: false },
			uvIndex: { selector: '.progressbar.uv-index', all: false },
			currentTemp: { selector: '.current-forecast-temp', all: false },
		});
	}

	queryElements(selectors) {
		Object.entries(selectors).forEach(([key, selectorOptions]) => {
			selectorOptions.all === false
				? (this.elements[key] = document.querySelector(selectorOptions.selector))
				: (this.elements[key] = document.querySelectorAll(selectorOptions.selector));
		});
	}

	populateTenDayForecast(tenDayForecast) {
		for (let i = 0; i < this.elements.highs.length; i++) {
			console.log(i);
			if (i === 0) {
				this.elements.dates[i].textContent = 'Today';
			} else if (i === 1) {
				this.elements.dates[i].textContent = 'Tomorrow';
			} else {
				this.elements.dates[i].textContent = format(parseISO(tenDayForecast[i].datetime), 'ccc do');
			}
			this.elements.highs[i].textContent = `${parseInt(tenDayForecast[i].tempmax)}°`;
			this.elements.lows[i].textContent = `${parseInt(tenDayForecast[i].tempmin)}°`;
		}
	}

	populateCircularReadout(circle, max, value) {
		const adjustedConicProgress = (value / max) * 100;

		circle.setAttribute('aria-valuenow', value);
		circle.style.setProperty('--progress', adjustedConicProgress + '%'); // for the conic gradient progress

		if (value >= max) {
			circle.classList.add('full-meter');
		} else {
			circle.classList.remove('full-meter');
		}
	}

	populateCurrentConditions(currentConditions, conditionDescription, minTemp, maxTemp, unit, timezone) {
		const currentCondtionDict = {
			conditions: condition => {
				this.elements.weatherState.textContent = condition;
			},
			feelslike: feelsLikeTemp => {
				this.elements.feelsLike.textContent = `Feels Like: ${feelsLikeTemp}°`;
			},
			humidity: currHumidity => {
				const maxHumidity = 100;
				this.populateCircularReadout(this.elements.humidity, maxHumidity, currHumidity);
			},
			icon: () => {},
			precipprob: precipProb => {
				const maxPrecipProb = 100;
				this.populateCircularReadout(this.elements.precipitation, maxPrecipProb, precipProb);
			},
			temp: currTemp => {
				this.elements.currentTemp.textContent = `${currTemp}°${unit === 'us' ? 'F' : 'C'}`;
			},
			uvindex: UVIndex => {
				const maxUVIndex = 12;
				this.populateCircularReadout(this.elements.uvIndex, maxUVIndex, UVIndex);
			},
		};

		for (let [weatherElement, value] of Object.entries(currentConditions)) {
			if (Object.hasOwn(currentCondtionDict, weatherElement)) {
				if (!isNaN(value)) value = parseInt(value);
				currentCondtionDict[weatherElement](value);
			}
		}

		this.elements.minTemp.textContent = `Lo: ${minTemp}°`;
		this.elements.maxTemp.textContent = `Hi: ${maxTemp}°`;
		this.elements.forecastDescription.textContent = conditionDescription;
	}

	populateData(weatherData) {
		this.populateCurrentConditions(
			weatherData.currentConditions,
			weatherData.conditionDescription,
			weatherData.minTemp,
			weatherData.maxTemp,
			weatherData.unit,
			weatherData.timezone,
		);
		this.populateTenDayForecast(weatherData.tenDayForecast);
	}
}
