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
	}

	async populateData() {
		if ((await this.weatherData.fetchWeatherData()) === null) {
			console.log('no weather data available');
			return 'no-data';
		}
		this.dom.startRevealAnimations();
		this.weatherData.trimDescription();
		console.log(this.weatherData.abbreviatedLocation);
		this.dom.setSeachbarMetaData(this.weatherData.abbreviatedLocation);
		this.dom.populateData({
			currentConditions: this.weatherData.currentConditions,
			conditionDescription: this.weatherData.conditionDescription,
			minTemp: this.weatherData.minTemp,
			maxTemp: this.weatherData.maxTemp,
			unit: this.weatherData.unit,
			timezone: this.weatherData.timezone,
			tenDayForecast: this.weatherData.getDays(10),
			nextFourtyEightHours: this.weatherData.getHours(2),
			timezone: this.weatherData.timezone,
		});
	}

	async refreshData() {
		if ((await this.weatherData.fetchWeatherData()) === null) {
			console.log('no weather data available');
			return;
		}
		this.weatherData.trimDescription();
		this.dom.populateData({
			currentConditions: this.weatherData.currentConditions,
			conditionDescription: this.weatherData.conditionDescription,
			minTemp: this.weatherData.minTemp,
			maxTemp: this.weatherData.maxTemp,
			unit: this.weatherData.unit,
			timezone: this.weatherData.timezone,
			tenDayForecast: this.weatherData.getDays(10),
			nextFourtyEightHours: this.weatherData.getHours(2),
			timezone: this.weatherData.timezone,
		});
	}

	searchNewLocation(e) {
		e.preventDefault();
		const focusedELement = document.activeElement;
		// prohibit enter key on searchbar
		if ([...focusedELement.attributes].some(attr => attr.nodeName === 'type' && attr.nodeValue === 'search')) {
			return;
		}

		const submitter = e.submitter;
		const location = submitter.value;
		this.searchbar.hideResults();

		this.weatherData.setLocation(location);
		const hasData = this.populateData();
		if (!hasData) return;

		this.dom.addAnimationConstrain();
		this.dom.startBlinkAnimation();
	}

	init() {
		this.populateData();
		this.elementKeeper.form.addEventListener('submit', e => this.searchNewLocation(e));
		setInterval(() => this.refreshData(), 600000); //10 minutes
	}
}

new App().init();
