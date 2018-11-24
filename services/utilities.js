const secondInMillis = 1000
const minuteInMillis = 60 * secondInMillis
const hourInMillis = 60 * minuteInMillis
const dayInMillis = 24 * hourInMillis

export const humanReadableTime = (milliseconds) => {
	const precision = 1
	if (milliseconds > dayInMillis) {
		return `${_.floor(milliseconds/dayInMillis, precision)}d`
	} else if (milliseconds > hourInMillis) {
		return `${_.floor(milliseconds/hourInMillis, precision)}h`
	} else if (milliseconds > minuteInMillis) {
		return `${_.floor(milliseconds/minuteInMillis, precision)}m`
	} else {
		return `${_.floor(milliseconds/secondInMillis, precision)}s`
	}
}

export const beginningOfDayTimestamp = () => {
	var now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}
