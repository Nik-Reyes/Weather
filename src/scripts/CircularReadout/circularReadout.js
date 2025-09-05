import './circular-readout.css';

export default function circularReadout(circle, max, value) {
	const adjustedConicProgress = (value / max) * 100;

	circle.setAttribute('aria-valuenow', value);
	circle.style.setProperty('--progress', adjustedConicProgress + '%'); // for the conic gradient progress

	if (value >= max) {
		circle.classList.add('full-meter');
	} else {
		circle.classList.remove('full-meter');
	}
}
