import './ten-day-forecast.css';
import { format, parseISO } from 'date-fns';

export default function tenDayForecast(tenDayForecast) {
	const highs = document.querySelectorAll('.ten-day-forecast .ten-day-high');
	const lows = document.querySelectorAll('.ten-day-forecast .ten-day-low');
	const dates = document.querySelectorAll('.ten-day-forecast .ten-day-card-title');

	for (let i = 0; i < highs.length; i++) {
		dates[i].textContent = format(parseISO(tenDayForecast[i].datetime), 'ccc do');
		highs[i].textContent = `${tenDayForecast[i].tempmax}°`;
		lows[i].textContent = `${tenDayForecast[i].tempmin}°`;
	}
}
