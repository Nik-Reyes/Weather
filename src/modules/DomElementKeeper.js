export default class DomElementKeeper {
	constructor() {
		this.elements = {};
		this.queryElements({
			dates: { selector: '.ten-day-forecast .ten-day-card-title', all: true },
			lows: { selector: '.ten-day-forecast .ten-day-low', all: true },
			highs: { selector: '.ten-day-forecast .ten-day-high', all: true },
			forecastDescription: { selector: '.weather-condition-blocks .weather-description', all: false },
			minTemp: { selector: '.low-temp-reading', all: false },
			maxTemp: { selector: '.high-temp-reading', all: false },
			currentTime: { selector: '.current-time', all: false },
			weatherState: { selector: '.weather-state.title', all: false },
			feelsLike: { selector: '.feels-like-temp', all: false },
			humidity: { selector: '.progressbar.humidity', all: false },
			precipitation: { selector: '.progressbar.precipitation', all: false },
			uvIndex: { selector: '.progressbar.uv-index', all: false },
			currentTemp: { selector: '.current-forecast-temp', all: false },
			times: { selector: '.time', all: true },
			hourlyTemps: { selector: '.hourly-temp', all: true },
			carousel: { selector: '.carousel', all: false },
			hourCards: { selector: '.hour-card', all: true },
			carouselWrapper: { selector: '.carousel-wrapper', all: false },
		});
	}

	queryElements(selectors) {
		Object.entries(selectors).forEach(([key, selectorOptions]) => {
			selectorOptions.all === false
				? (this.elements[key] = document.querySelector(selectorOptions.selector))
				: (this.elements[key] = document.querySelectorAll(selectorOptions.selector));
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
}
