import TimeKeeper from './TimeKeeper.js';
import CarouselHandler from './CarouselHandler.js';
import NWS from './NationalWeatherService.js';
import { format, parseISO } from 'date-fns';
import '../stylesheets/ten-day-forecast.css';
import '../stylesheets/current-forecast.css';
import '../stylesheets/circular-readout.css';
import '../stylesheets/hourly-forecast.css';
import '../stylesheets/searchbar.css';

export default class DomManager {
	constructor(elememts) {
		this.TWELVE_HOURS = 12;
		this.TWENTY_FOUR_HOURS = 24;
		this.elementKeeper = elememts;
		new CarouselHandler(
			this.elementKeeper.carousel,
			this.elementKeeper.hourCards,
			this.elementKeeper.carouselWrapper,
		);
		this.nws = new NWS();
		this.timeKeeper = new TimeKeeper();
		this.init();
	}

	getUnitString(unit) {
		return unit === 'us' ? 'F' : 'C';
	}

	async setImgIcon(img, icon) {
		const iconName = icon.toLowerCase();
		const iconModule = await import(
			`../assets/svgs/weatherIcons/${iconName}.svg`
		);
		const iconURL = iconModule.default;

		return new Promise(resolve => {
			img.onload = resolve;
			img.src = iconURL;
			img.alt = `${icon.split('-').join(' ')} icon`;
		});
	}

	setSeachbarMetaData(newLocation) {
		this.elementKeeper.searchbar.value = newLocation;
		this.elementKeeper.searchbar.innerText = newLocation;
	}

	async populateTenDayForecast(tenDayForecast, currentIcon) {
		const imgPromises = [];

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
				`${Math.round(tenDayForecast[i].tempmax)}°`;
			this.elementKeeper.lows[i].textContent =
				`${Math.round(tenDayForecast[i].tempmin)}°`;
			this.elementKeeper.dailyPrecipChance[i].innerText =
				`${Math.round(tenDayForecast[i].precipprob)}%`;

			const imgPromise =
				i === 0
					? this.setImgIcon(
							this.elementKeeper.dailyWeatherIcons[i],
							currentIcon,
						)
					: this.setImgIcon(
							this.elementKeeper.dailyWeatherIcons[i],
							tenDayForecast[i].icon,
						);
			imgPromises.push(imgPromise);
		}

		await Promise.all(imgPromises);
	}

	async populateHourlyForecast(
		nextTwentyFourHours,
		meridiem,
		currentIcon,
		currentHour,
	) {
		const imgPromises = [];
		const nextTwentyFourHoursPrecipChance = nextTwentyFourHours.map(hour =>
			Math.round(hour.precipprob),
		);

		for (let i = 0; i < this.TWENTY_FOUR_HOURS; i++) {
			let hour = (currentHour + i) % this.TWELVE_HOURS;
			if (hour === 0) {
				hour = this.TWELVE_HOURS;
				meridiem = meridiem === 'am' ? 'pm' : 'am';
			}
			this.elementKeeper.times[i].textContent = `${hour}${meridiem}`;
			this.elementKeeper.hourlyTemps[i].textContent =
				`${Math.round(nextTwentyFourHours[i].temp)}°`;
			this.elementKeeper.hourlyPrecipitationChances[i].innerText =
				`${nextTwentyFourHoursPrecipChance[i]}%`;

			const imgPromise =
				i === 0
					? this.setImgIcon(
							this.elementKeeper.hourlyWeatherIcons[i],
							currentIcon,
						)
					: this.setImgIcon(
							this.elementKeeper.hourlyWeatherIcons[i],
							nextTwentyFourHours[i].icon,
						);
			imgPromises.push(imgPromise);
		}
		await Promise.all(imgPromises);
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

	async populateCurrentConditions(
		currentConditions,
		conditionDescription,
		minTemp,
		maxTemp,
		unit,
	) {
		const imgPromises = [];
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
				imgPromises.push(
					this.setImgIcon(this.elementKeeper.currentWeatherIcon, icon),
				);
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
				this.elementKeeper.currentTemp.textContent = `${currTemp}°${this.getUnitString(unit)}`;
			},
			uvindex: UVIndex => {
				const maxUVIndex = 12;
				this.populateCircularReadout(
					this.elementKeeper.uvIndex,
					maxUVIndex,
					UVIndex,
				);
			},
			visibility: visibleDistance => {
				this.elementKeeper.visibleDistance.textContent = `${visibleDistance}mi`;
			},
		};

		for (let [weatherElement, value] of Object.entries(
			currentConditions,
		)) {
			if (Object.hasOwn(currentCondtionDict, weatherElement)) {
				if (!isNaN(value)) value = Math.round(value);
				currentCondtionDict[weatherElement](value);
			}
		}

		this.elementKeeper.minTemp.textContent = `${minTemp}°`;
		this.elementKeeper.maxTemp.textContent = `${maxTemp}°`;
		this.elementKeeper.forecastDescription.textContent =
			conditionDescription;
		await Promise.all(imgPromises);
	}

	async populateBottomLevelDecor(weatherStation) {
		let coords = null;
		if (!Array.isArray(weatherStation)) {
			const invalidStation = weatherStation;
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

	async setHourlyForecast(weatherData) {
		//fix setHourlyForecast being called two times at start
		await this.populateHourlyForecast(
			weatherData.nextTwentyFourHours,
			weatherData.meridiem,
			weatherData.currentIcon,
			weatherData.currentHour,
		);
	}

	setTime(currTime) {
		this.elementKeeper.currentTime.innerText = currTime;
	}

	processTime(timeData, weatherData) {
		const { currTime, prevHour, currHour } = timeData;
		if (currHour === prevHour) return;

		this.setTime(currTime);
		this.setHourlyForecast(weatherData);
	}

	async populateData(weatherData) {
		this.setTime(
			this.timeKeeper.startTimeKeeper(weatherData.timezone, timeData =>
				this.processTime(timeData, weatherData),
			),
		);

		await this.populateCurrentConditions(
			weatherData.currentConditions,
			weatherData.conditionDescription,
			weatherData.minTemp,
			weatherData.maxTemp,
			weatherData.unit,
			weatherData.timezone,
		);
		await this.populateBottomLevelDecor(weatherData.station);
		await this.populateTenDayForecast(
			weatherData.tenDayForecast,
			weatherData.currentIcon,
			weatherData.unit,
		);
		await this.setHourlyForecast(weatherData);
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

	updateSearchbarValue(location) {
		this.elementKeeper.searchbar.value = location;
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

	showNoLocationErrorMsg(location) {
		this.elementKeeper.noWeatherDataLocation.innerText = location;
		this.elementKeeper.nolocationModal.showModal();
	}

	handleOutOfBoundsClick(e) {
		const isInBounds = e
			.composedPath()
			.filter(el => el.classList !== undefined)
			.some(el => el.classList.contains(this.formClass));

		if (!isInBounds) {
			this.hideResults();
		}
	}

	convertToCelsius(temp, unit) {
		//tests to see if the user is starting on fahrenheit (us)
		if (unit === 'metric') {
			return temp;
		}
		return (temp - 32) * (5 / 9);
	}

	convertToFahrenheit(temp, unit) {
		//tests to see if the user is starting on fahrenheit (us)
		if (unit === 'us') {
			return temp;
		}
		return temp * (9 / 5) + 32;
	}

	convertUnits(weatherData, conversionMap, converstionMethod) {
		console.log(converstionMethod);
		for (let [prop, value] of Object.entries(weatherData)) {
			if (Object.hasOwn(conversionMap, prop)) {
				if (Array.isArray(value)) {
					value = value.map(val =>
						converstionMethod(val, weatherData.apiCallUnit),
					);
					conversionMap[prop](value);
				} else {
					value = converstionMethod(value, weatherData.apiCallUnit);
					conversionMap[prop](value);
				}
			}
		}
	}

	updateUnitsOfMeasurement(weatherData) {
		const temps = {
			hourlyTemps: this.elementKeeper.hourlyTemps,
			minTemp: this.elementKeeper.minTemp,
			maxTemp: this.elementKeeper.maxTemp,
			currentTemp: this.elementKeeper.currentTemp,
			feelsLike: this.elementKeeper.feelsLike,
			highs: this.elementKeeper.highs,
			lows: this.elementKeeper.lows,
		};

		const conversionMap = {
			currentTemp: temp => {
				temps.currentTemp.innerText = `${Math.round(temp)}°${this.getUnitString(weatherData.unit)}`;
			},
			feelsLike: temp =>
				(temps.feelsLike.innerText = `${Math.round(temp)}°`),
			maxTemp: temp => (temps.maxTemp.innerText = `${Math.round(temp)}°`),
			minTemp: temp => (temps.minTemp.innerText = `${Math.round(temp)}°`),
			nextTwentyFourHours: hoursArr => {
				temps.hourlyTemps.forEach((hour, i) => {
					hour.innerText = `${Math.round(hoursArr[i])}°`;
				});
			},
			tenDayHighs: highsArr => {
				temps.highs.forEach((high, i) => {
					high.innerText = `${Math.round(highsArr[i])}°`;
				});
			},
			tenDayLows: lowsArr => {
				temps.lows.forEach((low, i) => {
					low.innerText = `${Math.round(lowsArr[i])}°`;
				});
			},
		};

		if (weatherData.prevSIUnit === 'metric') {
			this.convertUnits(
				weatherData,
				conversionMap,
				this.convertToFahrenheit,
			);
		} else if (weatherData.prevSIUnit === 'us') {
			this.convertUnits(weatherData, conversionMap, this.convertToCelsius);
		}
	}

	updateUnitConversionBtn() {
		const unit = this.elementKeeper.unitConversionBtn.dataset.unit;
		this.elementKeeper.unitConversionBtn.dataset.unit =
			unit === 'fahrenheit' ? 'celsius' : 'fahrenheit';
	}

	handleSettingsClick() {
		this.elementKeeper.settingsWrapper.classList.toggle('hidden');
	}

	init() {
		this.elementKeeper.settingsBtn.addEventListener('click', () =>
			this.handleSettingsClick(),
		);
		this.elementKeeper.closeModalBtn.addEventListener('click', () => {
			this.elementKeeper.nolocationModal.close();
		});
		document.addEventListener('click', e =>
			this.handleOutOfBoundsClick(e),
		);
	}
}
