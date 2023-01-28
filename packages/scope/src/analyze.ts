/**
 *    /|   /|   /|   /|   /|   /|   /|
 *   / |  / |  / |  / |  / |  / |  / |
 *  /  | /  | /  | /  | /  | /  | /  |
 * /   |/   |/   |/   |/   |/   |/   |
 *
 */

/**
 * @param data - The wave form frames to analyze.
 * @returns An array of indexes that start a wave cycle.
 * @public
 */
export function analyze(data: Float32Array): number[] {
	const indexes: number[] = [];

	let frame = 0;
	let previous = 0;

	let start: number | null = null;

	for (let i = 0; i < data.length; i++) {
		frame = data[i];

		if (!previous) {
			previous = frame;
			continue;
		}

		/**
		 * The transition points of the cycle are not always on 0, will need to figure that out.
		 */
		if (isCrossing(frame, previous)) {
			if (frame >= 0) {
				if (start) {
					indexes.push(start);
				}
				start = i;
			}
		}

		previous = frame;
	}

	return indexes;
}

function isCrossing(frame: number, previous: number) {
	if ((frame >= 0 && previous < 0) || (frame < 0 && previous >= 0)) {
		return true;
	}
	return false;
}
