export default class WeatherData {
	constructor(location = 'Lake Forest, CA') {
		this._rawData = null;
		this._abbreviatedLocation = null;
		this._location = location;
		this._valid = false;
		this._baseURL =
			'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/';
		this._apiKey = 'D99Y9FUTYS77HVAMWTVJV9TV4';
		this._units = {
			metric: false,
			us: true,
		};
		this.noStation = {
			stationID: 'Unavailable',
			stationName: 'Unavailable',
			coords: '(LAT: N/A | LONG: N/A)',
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

	get weatherState() {
		return this.currentConditions.conditions;
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

	get validity() {
		return this._valid;
	}

	get nearestStation() {
		if (!Object.hasOwn(this._rawData, 'stations')) {
			return this.noStation;
		}

		const stations = Object.entries(this._rawData.stations);
		const distances = stations.map(
			stationArray => stationArray.at(1).distance,
		);
		const minDistance = Math.min.apply(null, distances);
		const nearestStationIdx = stations.findIndex(
			stationArray => stationArray.at(1).distance === minDistance,
		);

		return stations.at(nearestStationIdx);
	}

	get rawData() {
		return this._rawData;
	}

	set conditionDescription(description) {
		this._rawData.description = description;
	}

	set rawData(data) {
		this._rawData = data;
	}

	set weatherState(state) {
		return (this.currentConditions.conditions = state);
	}

	// accepts integer as number of days including today
	getHours(numOfDays) {
		if (numOfDays <= 0) {
			return;
		}
		if (numOfDays >= 15) {
			return;
		}
		const cumulativeHours = this._rawData.days
			.slice(0, numOfDays)
			.flatMap(day => day.hours);
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

	async fetchWeatherData() {
		try {
			const resp = await fetch(this.url);
			if (!resp.ok) {
				this._valid = false;
				return;
			} else {
				this._valid = true;
				this.rawData = await resp.json(); //other methods can use this without using another api call
				this.abbreviateLocation();
			}
		} catch (error) {
			return null;
		}
	}
}
