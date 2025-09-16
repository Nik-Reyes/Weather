import './hourly-forecast.css';
import { formatInTimeZone } from 'date-fns-tz';

//see description of { block: 'nearest' } here: https://stackoverflow.com/a/48635751/628418

export default function makeHours(nextFortyEightHours, timezone) {
	if (nextFortyEightHours.length !== 48) return;

	const carousel = document.querySelector('.carousel');
	const times = carousel.querySelectorAll('.time');
	const hourlyTemps = carousel.querySelectorAll('.hourly-temp');
	const hourCards = document.querySelectorAll('.hour-card');
	const hourCardsArr = Array.from(hourCards);
	const carouselWrapper = document.querySelector('.carousel-wrapper');

	const currentHour = parseInt(formatInTimeZone(new Date(), timezone, 'h'));
	let meridiem = formatInTimeZone(new Date(), timezone, 'aaa');
	const TWELVE_HOURS = 12;
	const TWENTY_FOUR_HOURS = 24;

	const meridiemAdjustedStartHour = meridiem === 'am' ? currentHour : currentHour + TWELVE_HOURS;
	const nextTwentyFourHours = nextFortyEightHours.slice(
		meridiemAdjustedStartHour,
		meridiemAdjustedStartHour + TWENTY_FOUR_HOURS,
	);

	for (let i = 0; i < TWENTY_FOUR_HOURS; i++) {
		let hour = (currentHour + i) % TWELVE_HOURS;
		if (hour === 0) {
			hour = TWELVE_HOURS;
			meridiem = meridiem === 'am' ? 'pm' : 'am';
		}
		times[i].textContent = `${hour}${meridiem}`;
		hourlyTemps[i].textContent = `${parseInt(nextTwentyFourHours[i].temp)}°`;
	}

	function shiftCarouselBackward(cardWidth) {
		const numberOfCards = Math.round(carousel.scrollLeft / cardWidth);

		if (numberOfCards - 1 <= 0) {
			hourCardsArr[0].scrollIntoView({ block: 'nearest' });
			return;
		}
		hourCardsArr[numberOfCards - 1].scrollIntoView({ block: 'nearest' });
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
		const carouselColGap = parseInt(window.getComputedStyle(carousel).getPropertyValue('column-gap')); //px
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
