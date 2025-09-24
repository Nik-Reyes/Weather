import OpenCageAPI from './OpenCage.js';

export default class Searchbar {
	constructor() {
		this.opencage = new OpenCageAPI();
	}

	async handleSearch(e) {
		const target = e.target;
		this._currSearch = target.value;
		return await this.opencage.getLocationData(this._currSearch);
	}
}
