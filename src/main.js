import WeatherData from './modules/WeatherDataService.js';
import DomManager from './modules/DomManager.js';
import DomElementKeeper from './modules/DomElementKeeper.js';
import './style.css';

class App {
	constructor() {
		this.elementKeeper = new DomElementKeeper();
		this.dom = new DomManager(this.elementKeeper);
		this.weatherData = new WeatherData();
	}

	async populateData() {
		await this.weatherData.fetchWeatherData();
		this.dom.startRevealAnimations();
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
		const searchbar = e.target[0];
		const formData = new FormData(e.target);
		const location = formData.get('location');
		searchbar.value = location;
		searchbar.blur();
		this.weatherData.setLocation(location);
		this.dom.addAnimationConstrain();
		this.populateData();
		this.dom.startBlinkAnimation();
	}

	init() {
		this.populateData();
		this.elementKeeper.form.addEventListener('submit', e => this.searchNewLocation(e));
		setInterval(this.populateData, 600000); //10 minutes
	}
}

new App().init();
