import './hourly-forecast.css';
import { format, parse } from 'date-fns';

//see description of { block: 'nearest' } here: https://stackoverflow.com/a/48635751/628418

export default function makeHours(time, rawHourlyData) {
	const currentHour = parseInt(format(new Date(), 'h'));
	let meridiem = format(new Date(), 'bbb');

	const hourCards = document.querySelectorAll('.hour-card');
	const hourCardsArr = Array.from(hourCards);
	const carousel = document.querySelector('.carousel');
	const carouselWrapper = document.querySelector('.carousel-wrapper');

	const times = carousel.querySelectorAll('.time');
	times.forEach((time, i) => {
		let hour = (currentHour + i) % 12;
		if (hour === 0) {
			hour = 12;
			meridiem = meridiem === 'am' ? 'pm' : 'am';
		}
		time.textContent = `${hour}${meridiem}`;
	});

	function shiftCarouselBackward(cardWidth) {
		const numberOfCards = Math.round(carousel.scrollLeft / cardWidth);

		if (numberOfCards - 2 <= 0) {
			hourCardsArrArr[0].scrollIntoView({ block: 'nearest' });
			return;
		}

		const decimalPortion = parseFloat('0.' + (carousel.scrollLeft / cardWidth + '').split(/\D/)[1]);
		decimalPortion >= 0.6
			? hourCardsArr[numberOfCards - 2].scrollIntoView({ block: 'nearest' })
			: hourCardsArr[numberOfCards - 1].scrollIntoView({ block: 'nearest' });
	}

	function shiftCarouselForward(cardWidth) {
		const carouselRightEdge = carousel.clientWidth + carousel.scrollLeft;
		const numberOfCards = carouselRightEdge / cardWidth;
		const wholeNumber = parseFloat((numberOfCards + '').split(/\D/).at(0));

		if (wholeNumber >= hourCardsArr.length - 1) {
			hourCardsArr[hourCardsArr.length - 1].scrollIntoView({ block: 'nearest' });
			return;
		} else {
			hourCardsArr.at(wholeNumber + 1).scrollIntoView({ block: 'nearest' });
		}
	}

	function handleCarouselDirectionClicks(e) {
		e.preventDefault();
		const target = e.target.closest('.carousel-btn');
		if (target === null) return;

		const targetClasses = target.classList;
		const carouselColGap = 10; //px
		const cardWidth = hourCardsArr[0].offsetWidth + carouselColGap;

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
