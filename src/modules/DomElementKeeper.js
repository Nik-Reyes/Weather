export default class DomElementKeeper {
	constructor() {
		this.elements = {};
		this.elementsToQuery = {
			dates: {
				selector: '.ten-day-forecast .ten-day-card-title',
				all: true,
			},
			lows: { selector: '.ten-day-forecast .ten-day-low', all: true },
			highs: { selector: '.ten-day-forecast .ten-day-high', all: true },
			forecastDescription: {
				selector: '.weather-condition-blocks .weather-description',
				all: false,
			},
			minTemp: { selector: '.low-temp-reading', all: false },
			maxTemp: { selector: '.high-temp-reading', all: false },
			currentTime: { selector: '.current-time', all: false },
			weatherState: { selector: '.weather-state.title', all: false },
			feelsLike: { selector: '.feels-like-temp', all: false },
			humidity: { selector: '.progressbar.humidity', all: false },
			precipitation: {
				selector: '.progressbar.precipitation',
				all: false,
			},
			uvIndex: { selector: '.progressbar.uv-index', all: false },
			currentTemp: { selector: '.current-forecast-temp', all: false },
			times: { selector: '.time', all: true },
			hourlyTemps: { selector: '.hourly-temp', all: true },
			carousel: { selector: '.carousel', all: false },
			hourCards: { selector: '.hour-card', all: true },
			carouselWrapper: { selector: '.carousel-wrapper', all: false },
			contentWrapper: { selector: '.content-wrapper', all: false },
			loaderTop: { selector: '.loader-top', all: false },
			loaderBottom: { selector: '.loader-bottom', all: false },
			form: { selector: 'form', all: false },
			searchbar: { selector: '[type="search"]', all: false },
			searchResultElements: { selector: '.search-result', all: true },
			searchResultContainer: { selector: '.search-results', all: false },
			noResults: { selector: '.no-results', all: false },
			currentWeatherIcon: {
				selector: '.current-forecast-description.card img',
				all: false,
			},
			hourlyWeatherIcons: {
				selector: '.hour-condition-icon img',
				all: true,
			},
			dailyWeatherIcons: {
				selector: '.ten-day-icon-wrapper img',
				all: true,
			},
			hourlyPrecipitationChances: {
				selector: '.hour-precip-chance',
				all: true,
			},
		};
		this.queryElements(this.elementsToQuery);
	}

	queryElements(selectors) {
		Object.entries(selectors).forEach(([key, selectorOptions]) => {
			selectorOptions.all === false
				? (this.elements[key] = document.querySelector(
						selectorOptions.selector,
					))
				: (this.elements[key] = document.querySelectorAll(
						selectorOptions.selector,
					));
		});
	}

	get dates() {
		return this.elements.dates;
	}
	get lows() {
		return this.elements.lows;
	}
	get highs() {
		return this.elements.highs;
	}
	get forecastDescription() {
		return this.elements.forecastDescription;
	}
	get minTemp() {
		return this.elements.minTemp;
	}
	get maxTemp() {
		return this.elements.maxTemp;
	}
	get currentTime() {
		return this.elements.currentTime;
	}
	get weatherState() {
		return this.elements.weatherState;
	}
	get feelsLike() {
		return this.elements.feelsLike;
	}
	get humidity() {
		return this.elements.humidity;
	}
	get precipitation() {
		return this.elements.precipitation;
	}
	get uvIndex() {
		return this.elements.uvIndex;
	}
	get currentTemp() {
		return this.elements.currentTemp;
	}
	get times() {
		return this.elements.times;
	}
	get hourlyTemps() {
		return this.elements.hourlyTemps;
	}
	get carousel() {
		return this.elements.carousel;
	}
	get hourCards() {
		return this.elements.hourCards;
	}
	get carouselWrapper() {
		return this.elements.carouselWrapper;
	}
	get contentWrapper() {
		return this.elements.contentWrapper;
	}
	get loaderTop() {
		return this.elements.loaderTop;
	}
	get loaderBottom() {
		return this.elements.loaderBottom;
	}
	get form() {
		return this.elements.form;
	}
	get searchbar() {
		return this.elements.searchbar;
	}
	get searchResultElements() {
		return this.elements.searchResultElements;
	}
	get searchResultContainer() {
		return this.elements.searchResultContainer;
	}
	get noResults() {
		return this.elements.noResults;
	}
	get currentWeatherIcon() {
		return this.elements.currentWeatherIcon;
	}
	get hourlyWeatherIcons() {
		return this.elements.hourlyWeatherIcons;
	}
	get dailyWeatherIcons() {
		return this.elements.dailyWeatherIcons;
	}
	get hourlyPrecipitationChances() {
		return this.elements.hourlyPrecipitationChances;
	}
}
