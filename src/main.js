import WeatherData from './modules/WeatherDataService.js';
import DomManager from './modules/DomManager.js';
import DomElementKeeper from './modules/DomElementKeeper.js';
import Searchbar from './modules/Seachbar.js';
import './style.css';

class App {
	constructor() {
		this.elementKeeper = new DomElementKeeper();
		this.dom = new DomManager(this.elementKeeper);
		this.weatherData = new WeatherData();
		this.searchbar = new Searchbar(this.elementKeeper);
		this.formClass = 'search-form';
	}

	async requestDOMDataPopulation() {
		await this.dom.populateData({
			currentConditions: this.weatherData.currentConditions,
			conditionDescription: this.weatherData.conditionDescription,
			minTemp: this.weatherData.minTemp,
			maxTemp: this.weatherData.maxTemp,
			unit: this.weatherData.unit,
			timezone: this.weatherData.timezone,
			tenDayForecast: this.weatherData.getDays(10),
			nextTwentyFourHours: this.weatherData.getNextTwentyFourHourData(),
			meridiem: this.weatherData.getMeridiem(),
			currentHour: this.weatherData.getCurrentHour(),
			timezone: this.weatherData.timezone,
			currentIcon: this.weatherData.currentIcon,
			station: this.weatherData.nearestStation,
		});
	}

	requestDOMUnitConversion() {
		const prevSIUnit = this.weatherData.unit;
		this.weatherData.toggleUnitOfMeasurement();
		this.dom.updateUnitsOfMeasurement({
			nextTwentyFourHours: this.weatherData.getNextTwentyFourHourTemps(),
			prevSIUnit: prevSIUnit,
			apiCallUnit: this.weatherData.apiCallUnit,
			minTemp: this.weatherData.minTemp,
			maxTemp: this.weatherData.maxTemp,
			currentTemp: this.weatherData.currentTemp,
			feelsLike: this.weatherData.feelsLike,
			tenDayLows: this.weatherData.getTenDayLows(),
			tenDayHighs: this.weatherData.getTenDayHighs(),
		});
		this.dom.updateUnitConversionBtn();
	}

	checkIfDataIsInvalid() {
		if (this.weatherData.validity === false) {
			return true;
		}
		return false;
	}

	async populateData() {
		await this.weatherData.fetchWeatherData();
		if (this.checkIfDataIsInvalid()) return null;

		this.dom.startBlinkAnimation();
		this.dom.addAnimationConstrain();
		this.dom.setSeachbarMetaData(this.weatherData.abbreviatedLocation);
		await this.requestDOMDataPopulation();
		this.dom.startRevealAnimations();
	}

	async refreshData() {
		await this.weatherData.fetchWeatherData();
		if (this.checkIfDataIsInvalid()) return;
		this.requestDOMDataPopulation();
	}

	searchNewLocation(e) {
		e.preventDefault();
		const focusedELement = document.activeElement;
		// prohibit form submition with enter key (user must explicitly select location)
		if (
			[...focusedELement.attributes].some(
				attr => attr.nodeName === 'type' && attr.nodeValue === 'search',
			)
		) {
			return;
		}

		const prevLocation = this.weatherData.abbreviatedLocation;
		const submitter = e.submitter;
		const location = submitter.value;
		this.dom.hideResults();
		this.weatherData.setLocation(location);
		this.populateData().then(returnVal => {
			if (returnVal === null) {
				this.dom.showNoLocationErrorMsg(location);
				this.dom.updateSearchbarValue(prevLocation);
			}
		});
	}

	async handleSearches(e) {
		const serachbarValue = e.target.value;
		if (serachbarValue === '') {
			this.dom.hideResults();
			return;
		}

		const searchResults = await this.searchbar.handleSearch(e);
		if (!searchResults) {
			this.dom.hideResults();
			this.dom.showNoResults();
			return;
		}

		this.dom.hideResults();
		this.dom.showLocationResults(searchResults);
	}

	init() {
		this.populateData();
		this.elementKeeper.form.addEventListener('submit', e =>
			this.searchNewLocation(e),
		);
		this.elementKeeper.searchbar.addEventListener('keyup', e =>
			this.handleSearches(e),
		);
		this.elementKeeper.unitConversionBtn.addEventListener('click', () =>
			this.requestDOMUnitConversion(),
		);
		setInterval(() => this.refreshData(), 1800000); //30 minutes: https://www.visualcrossing.com/resources/documentation/weather-api/how-to-look-up-the-current-weather-conditions-in-the-weather-api/
	}
}

new App().init();
