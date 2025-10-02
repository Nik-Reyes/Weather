import TimeKeeper from './TimeKeeper.js';
import CarouselHandler from './CarouselHandler.js';
import NWS from './NationalWeatherService.js';
import { format, parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import '../stylesheets/ten-day-forecast.css';
import '../stylesheets/current-forecast.css';
import '../stylesheets/circular-readout.css';
import '../stylesheets/hourly-forecast.css';
import '../stylesheets/searchbar.css';

export default class DomManager {
	constructor(elememts) {
		this.elementKeeper = elememts;
		this.nws = new NWS();
		this.timeKeeper = new TimeKeeper();
		new CarouselHandler(
			this.elementKeeper.carousel,
			this.elementKeeper.hourCards,
			this.elementKeeper.carouselWrapper,
		);
	}

	async setImgIcon(img, icon) {
		const iconName = icon.toLowerCase();
		const iconModule = await import(
			`../assets/svgs/weatherIcons/${iconName}.svg`
		);
		const iconURL = iconModule.default;

		img.src = iconURL;
		img.alt = `${icon.split('-').join(' ')} icon`;
	}

	setSeachbarMetaData(newLocation) {
		this.elementKeeper.searchbar.value = newLocation;
		this.elementKeeper.searchbar.innerText = newLocation;
	}

	populateTenDayForecast(tenDayForecast, currentIcon) {
		for (let i = 0; i < this.elementKeeper.highs.length; i++) {
			if (i === 0) {
				this.elementKeeper.dates[i].textContent = 'Today';
			} else if (i === 1) {
				this.elementKeeper.dates[i].textContent = 'Tomorrow';
			} else {
				this.elementKeeper.dates[i].textContent = format(
					parseISO(tenDayForecast[i].datetime),
					'ccc do',
				);
			}

			this.elementKeeper.highs[i].textContent =
				`${parseInt(tenDayForecast[i].tempmax)}°`;
			this.elementKeeper.lows[i].textContent =
				`${parseInt(tenDayForecast[i].tempmin)}°`;
			this.elementKeeper.dailyPrecipChance[i].innerText =
				`${parseInt(tenDayForecast[i].precipprob)}%`;

			i === 0
				? this.setImgIcon(
						this.elementKeeper.dailyWeatherIcons[i],
						currentIcon,
					)
				: this.setImgIcon(
						this.elementKeeper.dailyWeatherIcons[i],
						tenDayForecast[i].icon,
					);
		}
	}

	populateHourlyForecast(nextFortyEightHours, timezone, currentIcon) {
		if (nextFortyEightHours.length !== 48) return;

		const currentHour = parseInt(
			formatInTimeZone(new Date(), timezone, 'h'),
		);
		let meridiem = formatInTimeZone(new Date(), timezone, 'aaa');
		const TWELVE_HOURS = 12;
		const TWENTY_FOUR_HOURS = 24;

		const meridiemAdjustedStartHour =
			meridiem === 'am' ? currentHour : currentHour + TWELVE_HOURS;
		const nextTwentyFourHours = nextFortyEightHours.slice(
			meridiemAdjustedStartHour,
			meridiemAdjustedStartHour + TWENTY_FOUR_HOURS,
		);
		const nextTwentyFourHoursPrecipChance = nextTwentyFourHours.map(hour =>
			parseInt(hour.precipprob),
		);

		for (let i = 0; i < TWENTY_FOUR_HOURS; i++) {
			let hour = (currentHour + i) % TWELVE_HOURS;
			if (hour === 0) {
				hour = TWELVE_HOURS;
				meridiem = meridiem === 'am' ? 'pm' : 'am';
			}
			this.elementKeeper.times[i].textContent = `${hour}${meridiem}`;
			this.elementKeeper.hourlyTemps[i].textContent =
				`${parseInt(nextTwentyFourHours[i].temp)}°`;
			this.elementKeeper.hourlyPrecipitationChances[i].innerText =
				`${nextTwentyFourHoursPrecipChance[i]}%`;

			i === 0
				? this.setImgIcon(
						this.elementKeeper.hourlyWeatherIcons[i],
						currentIcon,
					)
				: this.setImgIcon(
						this.elementKeeper.hourlyWeatherIcons[i],
						nextTwentyFourHours[i].icon,
					);
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

	populateCurrentConditions(
		currentConditions,
		conditionDescription,
		minTemp,
		maxTemp,
		unit,
	) {
		const currentCondtionDict = {
			conditions: condition => {
				this.elementKeeper.weatherState.textContent = condition;
			},
			feelslike: feelsLikeTemp => {
				this.elementKeeper.feelsLike.textContent = `${feelsLikeTemp}°`;
			},
			humidity: currHumidity => {
				const maxHumidity = 100;
				this.populateCircularReadout(
					this.elementKeeper.humidity,
					maxHumidity,
					currHumidity,
				);
			},
			icon: icon => {
				this.setImgIcon(this.elementKeeper.currentWeatherIcon, icon);
			},
			precipprob: precipProb => {
				const maxPrecipProb = 100;
				this.populateCircularReadout(
					this.elementKeeper.precipitation,
					maxPrecipProb,
					precipProb,
				);
			},
			temp: currTemp => {
				this.elementKeeper.currentTemp.textContent = `${currTemp}°${unit === 'us' ? 'F' : 'C'}`;
			},
			uvindex: UVIndex => {
				const maxUVIndex = 12;
				this.populateCircularReadout(
					this.elementKeeper.uvIndex,
					maxUVIndex,
					UVIndex,
				);
			},
		};

		for (let [weatherElement, value] of Object.entries(
			currentConditions,
		)) {
			if (Object.hasOwn(currentCondtionDict, weatherElement)) {
				if (!isNaN(value)) value = parseInt(value);
				currentCondtionDict[weatherElement](value);
			}
		}

		this.elementKeeper.minTemp.textContent = `${minTemp}°`;
		this.elementKeeper.maxTemp.textContent = `${maxTemp}°`;
		this.elementKeeper.forecastDescription.textContent =
			conditionDescription;
	}

	async populateBottomLevelDecor(weatherStation) {
		let coords = null;
		if (!Array.isArray(weatherStation)) {
			const invalidStation = weatherStation;
			console.log('first');
			this.nws.stationID = invalidStation.stationID;
			this.nws.stationName = invalidStation.stationName;
			coords = invalidStation.coords;
		} else {
			this.nws.stationID = weatherStation[0];
			await this.nws.fetchStation();
			coords = `(LAT: ${weatherStation[1].latitude} | LONG: ${weatherStation[1].longitude})`;
		}

		this.elementKeeper.weatherStationCoords.innerText = coords;
		this.elementKeeper.weatherStationName.innerText = this.nws.stationName;
	}

	setHourlyForecast(weatherData) {
		//fix setHourlyForecast being called two times at start
		this.populateHourlyForecast(
			weatherData.nextFourtyEightHours,
			weatherData.timezone,
			weatherData.currentIcon,
		);
	}

	setTime(currTime) {
		this.elementKeeper.currentTime.innerText = currTime;
	}

	processTime(timeData, weatherData) {
		const { currTime, prevHour, currHour } = timeData;
		this.setTime(currTime);
		if (currHour !== prevHour) {
			//if the hour is different (the hour of the current time is greater than that of the previous time, then refresh the hourly cards)
			this.setHourlyForecast(weatherData);
		}
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
		this.populateTenDayForecast(
			weatherData.tenDayForecast,
			weatherData.currentIcon,
		);
		this.setHourlyForecast(weatherData);
		this.setTime(
			this.timeKeeper.startTimeKeeper(weatherData.timezone, timeData =>
				this.processTime(timeData, weatherData),
			),
		);
		console.log(weatherData);
		this.populateBottomLevelDecor(weatherData.station);
	}

	removeAnimations() {
		[
			this.elementKeeper.contentWrapper,
			this.elementKeeper.loaderTop,
			this.elementKeeper.loaderBottom,
		].forEach(element => {
			[...element.classList].forEach(cls => {
				if (cls.includes('animate')) {
					element.classList.remove(cls);
				}
			});
		});
	}

	startRevealAnimations() {
		this.elementKeeper.loaderTop.classList.add('animate-reveal');
		this.elementKeeper.loaderBottom.classList.add('animate-reveal');
		this.elementKeeper.loaderBottom.addEventListener(
			'animationend',
			() => {
				this.elementKeeper.loaderTop.classList.add('animate-retract');
				this.elementKeeper.loaderBottom.classList.add('animate-retract');
				this.elementKeeper.contentWrapper.classList.add(
					'animate-constrain',
					'animate-revealing',
				);
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

	hideResults() {
		this.elementKeeper.searchResultElements.forEach(searchResult => {
			searchResult.classList.add('hidden');
		});
		this.elementKeeper.noResults.classList.add('hidden');
	}

	showLocationResults(searchResults) {
		this.elementKeeper.searchResultContainer.classList.remove('hidden');
		for (let i = 0; i < searchResults.length; i++) {
			this.elementKeeper.searchResultElements[i].classList.remove(
				'hidden',
			);
			this.elementKeeper.searchResultElements[i].textContent =
				searchResults[i];
			this.elementKeeper.searchResultElements[i].value = searchResults[i];
		}
	}

	showNoResults() {
		this.elementKeeper.searchResultContainer.classList.remove('hidden');
		this.elementKeeper.noResults.classList.remove('hidden');
	}
}
