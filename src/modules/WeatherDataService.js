export default class WeatherData {
	constructor(location = 'Lake Forest, CA') {
		this._rawData = null;
		this._abbreviatedLocation = null;
		this._location = location;
		this._baseURL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
		this._apiKey = 'D99Y9FUTYS77HVAMWTVJV9TV4';
		this._units = {
			metric: false,
			us: true,
		};
	}

	abbreviateLocation() {
		this._abbreviatedLocation = this._location.split(',').at(0);
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

	get abbreviatedLocation() {
		return this._abbreviatedLocation;
	}

	get currentIcon() {
		return this._rawData.currentConditions.icon;
	}

	get hourlyIcons() {
		return this._rawData.currentConditions.icon;
	}

	get dailyIcons() {
		return this._rawData.currentConditions.icon;
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
			return;
		}
		if (numOfDays >= 15) {
			return;
		}
		const cumulativeHours = this._rawData.days.slice(0, numOfDays).flatMap(day => day.hours);
		return cumulativeHours;
	}

	getDays(numOfDays) {
		if (numOfDays <= 0) {
			return;
		}
		if (numOfDays >= 15) {
			return;
		}
		return this._rawData.days.slice(0, numOfDays);
	}

	trimDescription() {
		const textToTrim = 'similar temperatures continuing';
		if (this.conditionDescription.toLowerCase().includes(textToTrim)) {
			this.conditionDescription = 'Similar temperatures continuing.';
		}
	}

	async fetchWeatherData() {
		try {
			const resp = await fetch(this.url);
			this.rawData = await resp.json(); //other methods can use this without using another api call
			this.abbreviateLocation();
		} catch (error) {
			return null;
		}
	}
}
