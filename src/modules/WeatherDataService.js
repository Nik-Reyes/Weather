export default class WeatherData {
	constructor(location = 'los angeles') {
		this._rawData = null;
		this._location = location;
		this._baseURL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
		this._apiKey = 'D99Y9FUTYS77HVAMWTVJV9TV4';
	}

	setLocation(newLocation) {
		this._location = newLocation;
		this._rawData = null;
	}

	get url() {
		return `${this._baseURL}${this._location}?unitGroup=us&key=${this._apiKey}&contentType=json`;
	}

	get rawData() {
		return this._rawData;
	}

	get hour() {
		return parseInt(this.rawData.currentConditions.datetime);
	}

	get todaysWeatherData() {
		return this.rawData.days[0];
	}

	get hourlyData() {
		return this.todaysWeatherData.hours;
	}

	set rawData(data) {
		this._rawData = data;
	}

	// accepts integer as number of days including today
	getDays(numOfDays) {
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

	async fetchWeatherData() {
		try {
			const resp = await fetch(this.url);
			this.rawData = await resp.json(); //other methods can use this without using another api call
		} catch (error) {
			console.log(error);
		}
	}
}
