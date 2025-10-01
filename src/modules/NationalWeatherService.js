export default class NWS {
	constructor() {
		this._rawData = null;
		this._stationID = null;
		this.baseURL = 'https://api.weather.gov/stations/';
		this._stationName = null;
	}

	async fetchStation() {
		try {
			this.response = await fetch(`${this.baseURL}${this._stationID}`);
			if (!this.response.ok) {
				this._stationName = this._stationID;
			} else {
				this._rawData = await this.response.json();
				this._stationName = this._rawData.properties.name;
			}
		} catch (error) {
			throw new Error(error);
		}
	}

	get stationName() {
		return this._stationName;
	}

	set stationID(stationID) {
		this._stationID = stationID;
	}
}
