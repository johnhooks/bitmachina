/**
 * Calculate a percentage from a ratio rounded to down to an integer.
 */
export function percent(value: number, min: number, max: number) {
	return Math.floor(((value - min) / (max - min)) * 100);
}
