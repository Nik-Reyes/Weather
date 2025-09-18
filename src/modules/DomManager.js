import TimeKeeper from './TimeKeeper.js';
import DomElementKeeper from './DomElementKeeper.js';
import CarouselHandler from './CarouselHandler.js';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import '../stylesheets/ten-day-forecast.css';
import '../stylesheets/current-forecast.css';
import '../stylesheets/circular-readout.css';
import '../stylesheets/hourly-forecast.css';

export default class DomManager {
	constructor(elememts) {
		this.elementKeeper = elememts;
		this.timeKeeper = new TimeKeeper(this.elementKeeper.currentTime);
		new CarouselHandler(this.elementKeeper.carousel, this.elementKeeper.hourCards, this.elementKeeper.carouselWrapper);
	}

	populateTenDayForecast(tenDayForecast) {
		for (let i = 0; i < this.elementKeeper.highs.length; i++) {
			if (i === 0) {
				this.elementKeeper.dates[i].textContent = 'Today';
			} else if (i === 1) {
				this.elementKeeper.dates[i].textContent = 'Tomorrow';
			} else {
				this.elementKeeper.dates[i].textContent = format(parseISO(tenDayForecast[i].datetime), 'ccc do');
			}
			this.elementKeeper.highs[i].textContent = `${parseInt(tenDayForecast[i].tempmax)}°`;
			this.elementKeeper.lows[i].textContent = `${parseInt(tenDayForecast[i].tempmin)}°`;
		}
	}

	populateHourlyForecast(nextFortyEightHours, timezone) {
		if (nextFortyEightHours.length !== 48) return;

		const currentHour = parseInt(formatInTimeZone(new Date(), timezone, 'h'));
		let meridiem = formatInTimeZone(new Date(), timezone, 'aaa');
		const TWELVE_HOURS = 12;
		const TWENTY_FOUR_HOURS = 24;

		const meridiemAdjustedStartHour = meridiem === 'am' ? currentHour : currentHour + TWELVE_HOURS;
		const nextTwentyFourHours = nextFortyEightHours.slice(
			meridiemAdjustedStartHour,
			meridiemAdjustedStartHour + TWENTY_FOUR_HOURS,
		);

		for (let i = 0; i < TWENTY_FOUR_HOURS; i++) {
			let hour = (currentHour + i) % TWELVE_HOURS;
			if (hour === 0) {
				hour = TWELVE_HOURS;
				meridiem = meridiem === 'am' ? 'pm' : 'am';
			}
			this.elementKeeper.times[i].textContent = `${hour}${meridiem}`;
			this.elementKeeper.hourlyTemps[i].textContent = `${parseInt(nextTwentyFourHours[i].temp)}°`;
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
				this.elementKeeper.weatherState.textContent = condition;
			},
			feelslike: feelsLikeTemp => {
				this.elementKeeper.feelsLike.textContent = `Feels Like: ${feelsLikeTemp}°`;
			},
			humidity: currHumidity => {
				const maxHumidity = 100;
				this.populateCircularReadout(this.elementKeeper.humidity, maxHumidity, currHumidity);
			},
			icon: () => {},
			precipprob: precipProb => {
				const maxPrecipProb = 100;
				this.populateCircularReadout(this.elementKeeper.precipitation, maxPrecipProb, precipProb);
			},
			temp: currTemp => {
				this.elementKeeper.currentTemp.textContent = `${currTemp}°${unit === 'us' ? 'F' : 'C'}`;
			},
			uvindex: UVIndex => {
				const maxUVIndex = 12;
				this.populateCircularReadout(this.elementKeeper.uvIndex, maxUVIndex, UVIndex);
			},
		};

		for (let [weatherElement, value] of Object.entries(currentConditions)) {
			if (Object.hasOwn(currentCondtionDict, weatherElement)) {
				if (!isNaN(value)) value = parseInt(value);
				currentCondtionDict[weatherElement](value);
			}
		}

		this.elementKeeper.minTemp.textContent = `Lo: ${minTemp}°`;
		this.elementKeeper.maxTemp.textContent = `Hi: ${maxTemp}°`;
		this.elementKeeper.forecastDescription.textContent = conditionDescription;
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
		this.populateHourlyForecast(weatherData.nextFourtyEightHours, weatherData.timezone);
		this.timeKeeper.startTimeKeeper(weatherData.timezone);
	}

	removeAnimations() {
		[this.elementKeeper.contentWrapper, this.elementKeeper.loaderTop, this.elementKeeper.loaderBottom].forEach(
			element => {
				[...element.classList].forEach(cls => {
					if (cls.includes('animate')) {
						element.classList.remove(cls);
					}
				});
			},
		);
	}

	startRevealAnimations() {
		this.elementKeeper.loaderTop.classList.add('animate-reveal');
		this.elementKeeper.loaderBottom.classList.add('animate-reveal');
		this.elementKeeper.loaderBottom.addEventListener(
			'animationend',
			() => {
				this.elementKeeper.loaderTop.classList.add('animate-retract');
				this.elementKeeper.loaderBottom.classList.add('animate-retract');
				this.elementKeeper.contentWrapper.removeAttribute('style');
				this.elementKeeper.contentWrapper.classList.add('animate-constrain', 'animate-revealing');
				this.elementKeeper.contentWrapper.addEventListener(
					'animationend',
					() => {
						this.removeAnimations();
					},
					{ once: true },
				);
			},
			{ once: true },
		);
	}

	addAnimationConstrain() {
		this.elementKeeper.contentWrapper.classList.add('animate-constrain');
	}

	startBlinkAnimation() {
		this.elementKeeper.loaderTop.classList.add('animate-blink');
		this.elementKeeper.loaderBottom.classList.add('animate-blink');
	}
}
