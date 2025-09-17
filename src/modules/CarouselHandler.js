//see description of { block: 'nearest' } here: https://stackoverflow.com/a/48635751/628418

export default class CarouselHandler {
	constructor(carousel, hourCards, carouselWrapper) {
		this.carousel = carousel;
		this.hourCardsArr = Array.from(hourCards);
		this.carouselWrapper = carouselWrapper;
		this.init();
	}

	shiftCarouselBackward(cardWidth) {
		const numberOfCards = Math.round(this.carousel.scrollLeft / cardWidth);

		if (numberOfCards - 1 <= 0) {
			this.hourCardsArr[0].scrollIntoView({ block: 'nearest' });
			return;
		}
		this.hourCardsArr[numberOfCards - 1].scrollIntoView({ block: 'nearest' });
	}

	shiftCarouselForward(cardWidth) {
		const carouselRightEdge = this.carousel.clientWidth + this.carousel.scrollLeft;
		const numberOfCards = carouselRightEdge / cardWidth;
		const wholeNumber = parseFloat((numberOfCards + '').split(/\D/).at(0));

		if (wholeNumber >= this.hourCardsArr.length - 1) {
			this.hourCardsArr[this.hourCardsArr.length - 1].scrollIntoView({ block: 'nearest' });
			return;
		} else {
			this.hourCardsArr.at(wholeNumber + 1).scrollIntoView({ block: 'nearest' });
		}
	}

	handleCarouselDirectionClicks(e) {
		const target = e.target.closest('.carousel-btn');
		if (target === null) return;

		const targetClasses = target.classList;
		const carouselColGap = parseInt(window.getComputedStyle(this.carousel).getPropertyValue('column-gap')); //px
		const cardWidth = this.hourCardsArr[0].offsetWidth + carouselColGap;

		const directionMapping = {
			backward: () => this.shiftCarouselBackward(cardWidth),
			forward: () => this.shiftCarouselForward(cardWidth),
		};

		for (let [direction, handler] of Object.entries(directionMapping)) {
			if (targetClasses.contains(direction)) {
				handler();
			}
		}
	}

	scrollToCurrentHour() {
		this.hourCardsArr[0].scrollIntoView({ block: 'start' });
	}

	init() {
		this.carouselWrapper.addEventListener('click', e => this.handleCarouselDirectionClicks(e));
		// this.scrollToCurrentHour();
	}
}
