import { formatInTimeZone } from 'date-fns-tz';

export default class TimeKeeper {
	constructor(currentTime) {
		this.intervalID = null;
		this.currentTimeElement = currentTime;
	}

	startTimeKeeper(timezone) {
		this.currentTimeElement.textContent = formatInTimeZone(new Date(), timezone, 'h:mmaaa');

		if (this.intervalID !== null) clearInterval(this.intervalID);
		this.intervalID = setInterval(() => {
			const timer = formatInTimeZone(new Date(), timezone, 'h:mmaaa');
			this.currentTimeElement.textContent = timer;
		}, 1000);
	}
}
