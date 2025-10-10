import { formatInTimeZone } from 'date-fns-tz';

export default class WeatherData {
	constructor(location = 'Lake Forest, CA') {
		this.TWELVE_HOURS = 12;
		this.TWENTY_FOUR_HOURS = 24;
		this._apiCallUnit = null;
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
		const splitLocation = this._location.split(',');
		const region =
			splitLocation.at(-1).trim() === 'USA'
				? splitLocation.at(-2)
				: splitLocation.at(-1);
		this._abbreviatedLocation = `${splitLocation.at(0)},${region}`;
	}

	setLocation(newLocation) {
		this._location = newLocation;
		this._rawData = null;
	}

	//swaps units truthiness
	toggleUnitOfMeasurement() {
		[this._units.metric, this._units.us] = [
			this._units.us,
			this._units.metric,
		];
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

	get apiCallUnit() {
		return this._apiCallUnit;
	}

	set apiCallUnit(unit) {
		this._apiCallUnit = unit;
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

	get currentTemp() {
		return this._rawData.currentConditions.temp;
	}

	get feelsLike() {
		return this._rawData.currentConditions.feelslike;
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

	get location() {
		return this._location;
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

	getTenDayHighs() {
		return this.getDays(10).map(day => day.tempmax);
	}

	getTenDayLows() {
		return this.getDays(10).map(day => day.tempmin);
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

	getNextFortyEightHours() {
		return this.getHours(2); // 2 === 2 days (48 hours)
	}

	getNextTwentyFourHours() {
		return this.getNextFortyEightHours()
			.slice(
				this.getMerdiemAdjustedStartHour(),
				this.getMerdiemAdjustedStartHour() + this.TWENTY_FOUR_HOURS,
			)
			.map(hour => hour.temp);
	}

	getMeridiem() {
		return formatInTimeZone(new Date(), this.timezone, 'aaa');
	}

	getCurrentHour() {
		return parseInt(formatInTimeZone(new Date(), this.timezone, 'h'));
	}

	getMerdiemAdjustedStartHour() {
		return this.getMeridiem() === 'am'
			? this.getCurrentHour()
			: this.getCurrentHour() + this.TWELVE_HOURS;
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
				this.apiCallUnit = this.unit;
			}
		} catch (error) {
			return null;
		}
	}
}
