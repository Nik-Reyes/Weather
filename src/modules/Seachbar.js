import OpenCageAPI from './OpenCage.js';

export default class Searchbar {
	constructor(elements) {
		this.opencage = new OpenCageAPI();

		this.searchbar = elements.searchbar;
		this.searchResultsContainer = elements.searchResultContainer;
		this.searchResultElements = elements.searchResultElements;
		this.noResults = elements.noResults;
		this.formattedData = null;
		this.location = null;
		this.activelySearching = false;
		this.formClass = 'search-form';

		this.init();
	}

	handleOutOfBoundsClick(e) {
		const isInBounds = e
			.composedPath()
			.filter(el => el.classList !== undefined)
			.some(el => el.classList.contains(this.formClass));

		if (!isInBounds) {
			this.activelySearching = false;
			this.hideResults();
		}
	}

	hideResults() {
		this.searchResultElements.forEach(searchResult => {
			searchResult.classList.add('hidden');
		});
		this.noResults.classList.add('hidden');
	}

	showLocationResults() {
		for (let i = 0; i < this.formattedData.length; i++) {
			this.searchResultElements[i].classList.remove('hidden');
			this.searchResultElements[i].textContent = this.formattedData[i];
			this.searchResultElements[i].value = this.formattedData[i];
		}
	}

	async handleSearch(e) {
		const target = e.target;
		if (target.value === '') {
			// hide the results popup if the user deletes all text
			// this.searchResultsContainer.classList.add('hidden');
			return;
		}

		this.activelySearching = true;
		this.location = target.value;
		const data = await this.opencage.getLocationData(this.location);
	}

	init() {
		this.searchbar.addEventListener('keyup', e => this.handleSearch(e));
		// document.addEventListener('click', e => this.handleOutOfBoundsClick(e));
	}
}
