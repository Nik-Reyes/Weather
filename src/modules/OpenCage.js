export default class OpenCageAPI {
	constructor() {
		this._getLocationData = this.debounce(() => this.processResults());
		this._formattedData = null;
		this.location = null;
	}

	get getLocationData() {
		return this._getLocationData;
	}

	get formattedData() {
		return this._formattedData;
	}

	trimZIP(location) {
		return location.replace(location.match(/ \d+|\d+ /), '') || location;
	}

	formatUSA(location, stateCode, countryCode, state) {
		if (countryCode === 'us' && location.includes(state)) {
			return location.replace(state, stateCode);
		}
		return location;
	}

	async getLocation() {
		try {
			const locationResponse = await fetch(
				`https://api.opencagedata.com/geocode/v1/json?q=${this.location}&abbrv=1&address_only=1&key=785a8a07be864fe2871868ad991144c0`,
			);
			return await locationResponse.json();
		} catch (err) {
			console.log(err);
		}
	}

	async processResults() {
		try {
			const json = await this.getLocation();
			const locationResults = json.results;
			if (locationResults.length === 0) {
				//need to figure out a way to tie this back into DOM
				//if there are no results, then the no results DIV needs to appear
				return null;
			}

			this._formattedData = locationResults.map((location, i) => {
				const locationComponents = locationResults[i].components;
				const ziplessLocation = this.trimZIP(location.formatted);
				return this.formatUSA(
					ziplessLocation,
					locationComponents.state_code,
					locationComponents.country_code,
					locationComponents.state,
				);
			});

			return this._formattedData;
		} catch (err) {
			console.log(err);
		}
	}

	debounce(processResults, timeout = 300) {
		let timer = null;
		return async location => {
			this.location = location;
			clearTimeout(timer);

			const locations = await new Promise(resolve => {
				timer = setTimeout(async () => {
					resolve(await processResults());
				}, timeout);
			});
			return locations;
		};
	}
}
