export default class WeatherData {
	constructor(location = 'Miami, FL') {
		this._rawData = null;
		this._location = location;
		this._baseURL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
		this._apiKey = 'D99Y9FUTYS77HVAMWTVJV9TV4';
		this._units = {
			metric: false,
			us: true,
		};
	}

	setLocation(newLocation) {
		this._location = newLocation;
		this._rawData = null;
	}

	get unit() {
		const bools = Object.values(this._units);
		if (new Set(bools).size !== bools.length) {
			throw Error('Error: duplicate measurement unit detected');
		}
		for (let [unit, bool] of Object.entries(this._units)) {
			if (bool) {
				return unit;
			}
		}
	}

	get url() {
		return `${this._baseURL}${this._location}?unitGroup=${this.unit}&key=${this._apiKey}&contentType=json&iconSet=icons2`;
	}

	get todaysWeatherData() {
		return this._rawData.days[0];
	}

	get hourlyData() {
		return this.todaysWeatherData.hours;
	}

	get currentConditions() {
		return this._rawData.currentConditions;
	}

	get conditionDescription() {
		return this._rawData.description;
	}

	get minTemp() {
		return parseInt(this.todaysWeatherData.tempmin);
	}

	get maxTemp() {
		return parseInt(this.todaysWeatherData.tempmax);
	}

	get timezone() {
		return this._rawData.timezone;
	}

	set conditionDescription(description) {
		this._rawData.description = description;
	}

	set rawData(data) {
		this._rawData = data;
	}

	// accepts integer as number of days including today
	getHours(numOfDays) {
		if (numOfDays <= 0) {
			console.log('Must specify amount of days greater than 0');
			return;
		}
		if (numOfDays >= 15) {
			console.log('Must specify amount of days less than 15');
			return;
		}
		const cumulativeHours = this._rawData.days.slice(0, numOfDays).flatMap(day => day.hours);
		return cumulativeHours;
	}

	getDays(numOfDays) {
		if (numOfDays <= 0) {
			console.log('Must specify amount of days greater than 0');
			return;
		}
		if (numOfDays >= 15) {
			console.log('Must specify amount of days less than 15');
			return;
		}
		return this._rawData.days.slice(0, numOfDays);
	}

	trimDescription() {
		const textToTrim = 'with no rain expected.';
		const description = this.conditionDescription;
		if (description.includes(textToTrim)) {
			this.conditionDescription = `${description.replaceAll(textToTrim, '').trim()}.`;
		}
	}

	async fetchWeatherData() {
		try {
			const resp = await fetch(this.url);
			this.rawData = await resp.json(); //other methods can use this without using another api call
		} catch (error) {
			console.log(error);
		}
	}
}
