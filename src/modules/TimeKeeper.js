import { formatInTimeZone } from 'date-fns-tz';

export default class TimeKeeper {
	constructor() {
		this.intervalID = null;
		this.currTime = null;
		this.prevTime = null;
		this.currHour = null;
		this.prevHour = null;
	}

	parseHour(time) {
		return time.split(':').at(0);
	}

	startTimeKeeper(timezone, callback) {
		if (this.intervalID !== null) clearInterval(this.intervalID);
		this.intervalID = setInterval(() => {
			this.prevTime = this.currTime || '0';
			this.prevHour = this.parseHour(this.prevTime);
			this.currTime = formatInTimeZone(new Date(), timezone, 'h:mmaaa');
			this.currHour = this.parseHour(this.currTime);

			callback({
				currTime: this.currTime,
				prevHour: this.prevHour,
				currHour: this.currHour,
			});
		}, 1000);
		return formatInTimeZone(new Date(), timezone, 'h:mmaaa');
	}
}
