import './circular-readout.css';

export default function circularReadout() {
	const maxProgress = 12;
	const progress = 10;
	const adjustedConicProgress = (progress / maxProgress) * 100;

	const progressCircles = document.querySelectorAll('[role=progressbar]');
	progressCircles.forEach(circle => {
		circle.setAttribute('aria-valuenow', progress);
		circle.style.setProperty('--progress', adjustedConicProgress + '%');
		if (progress >= maxProgress) {
			circle.classList.add('full-meter');
		} else {
			circle.classList.remove('full-meter');
		}
	});
}
