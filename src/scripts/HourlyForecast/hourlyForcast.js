import './hourly-forecast.css';

export default function makeHours() {
	const hourCards = Array.from(document.querySelectorAll('.hour-card'));
	const carousel = document.querySelector('.carousel');
	const carouselWrapper = document.querySelector('.carousel-wrapper');

	function shiftCarouselBackward(cardWidth) {
		const numberOfCards = Math.round(carousel.scrollLeft / cardWidth);

		if (numberOfCards - 2 <= 0) {
			hourCards[0].scrollIntoView();
			return;
		}

		const decimalPortion = parseFloat('0.' + (carousel.scrollLeft / cardWidth + '').split(/\D/)[1]);
		decimalPortion >= 0.6
			? hourCards[numberOfCards - 2].scrollIntoView()
			: hourCards[numberOfCards - 1].scrollIntoView();
	}

	function shiftCarouselForward(cardWidth) {
		const carouselRightEdge = carousel.clientWidth + carousel.scrollLeft;
		const numberOfCards = carouselRightEdge / cardWidth;
		const wholeNumber = parseFloat((numberOfCards + '').split(/\D/).at(0));

		if (wholeNumber >= hourCards.length - 1) {
			hourCards[hourCards.length - 1].scrollIntoView();
			return;
		} else {
			hourCards.at(wholeNumber + 1).scrollIntoView();
		}
	}

	function handleCarouselDirectionClicks(e) {
		const target = e.target.closest('.carousel-btn');
		if (target === null) return;

		const targetClasses = target.classList;
		const carouselColGap = 10; //px
		const cardWidth = hourCards[0].offsetWidth + carouselColGap;

		const directionMapping = {
			backward: () => shiftCarouselBackward(cardWidth),
			forward: () => shiftCarouselForward(cardWidth),
		};

		for (let [direction, handler] of Object.entries(directionMapping)) {
			if (targetClasses.contains(direction)) {
				handler();
			}
		}
	}

	carouselWrapper.addEventListener('click', handleCarouselDirectionClicks);
}
