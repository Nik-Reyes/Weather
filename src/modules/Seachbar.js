export default class Searchbar {
	constructor(elements) {
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

	processResults() {
		this.getLocation().then(data => {
			const results = data.results;
			if (results.length === 0) {
				this.searchResultsContainer.classList.remove('hidden');
				this.hideResults();
				this.noResults.classList.remove('hidden');
				return;
			}
			this.formattedData = results.map((location, i) => {
				const locationComponents = results[i].components;
				const ziplessLocation = this.trimZIP(location.formatted);
				return this.formatUSA(
					ziplessLocation,
					locationComponents.state_code,
					locationComponents.country_code,
					locationComponents.state,
				);
			});
			if (this.formattedData.length === 0) return;
			this.searchResultsContainer.classList.remove('hidden');
			this.hideResults();
			this.showLocationResults();
		});
	}

	debounce(processResults, timeout = 300) {
		let timer = null;
		return () => {
			if (this.location === '') return;
			clearTimeout(timer);
			timer = setTimeout(processResults, timeout);
		};
	}

	getLocationData = this.debounce(() => this.processResults());

	handleSearch(e) {
		const target = e.target;

		this.activelySearching = true;
		if (target.value === '') {
			this.searchResultsContainer.classList.add('hidden');
			return;
		}

		if (this.activelySearching) {
			this.location = target.value;
			this.getLocationData();
		}
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

	init() {
		this.searchbar.addEventListener('keyup', e => this.handleSearch(e));
		document.addEventListener('click', e => this.handleOutOfBoundsClick(e));
	}
}
