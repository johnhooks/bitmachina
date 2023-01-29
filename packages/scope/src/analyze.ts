/**
 *    /|   /|   /|   /|   /|   /|   /|   /|   /|   /|   /|   /|   /|
 *   / |  / |  / |  / |  / |  / |  / |  / |  / |  / |  / |  / |  / |
 *  /  | /  | /  | /  | /  | /  | /  | /  | /  | /  | /  | /  | /  |
 * /   |/   |/   |/   |/   |/   |/   |/   |/   |/   |/   |/   |/   |
 *
 */

import type { Cycle } from "./types.js";

/**
 * This should eventually be dynamic based on zoom.
 */
const FRAMES = 256;

/**
 * [x] TODO: keep track of the height of the last cycle.
 * I noticed when applying a lot of resonance to a filter the waveform starts to
 * cross the zero threshold before completing the full cycle and my algorithm doesn't
 * take that into account.
 *
 * [x] TODO: Consider converting this to a class.
 * It would be easier to keep track of the last call of analyze and maintain an
 * average wave height, which would help detect full wave cycles.
 */

/**
 * @public
 */
export class Analyser {
	/**
	 * The reference to the data array to analyze.
	 */
	protected _dataArray: Float32Array;

	/**
	 * A buffer containing the widths of last 10 cycle captured.
	 *
	 * Whether or not it should be more or less than 10 is TBD.
	 */
	protected _prevCycleWidths: number[] = [];

	/**
	 * A buffer containing the heights of last 10 cycle captured.
	 *
	 * Whether or not it should be more or less than 10 is TBD.
	 */
	protected _prevCycleHeights: number[] = [];

	/**
	 * The index the current position in the analysis of the `_dataArray`.
	 */
	protected _pos = 0;

	/**
	 * The value contained at the current `_pos` in the `_dataArray`.
	 */
	protected _frame = 0;

	/**
	 * The value contained at the index before the current `_pos` in the `_dataArray`.
	 */
	protected _previous = 0;

	/**
	 * The index of the start position of the wave cycle capture.
	 */
	protected _start = 0;

	/**
	 * The index of the current highest value of the wave cycle capture.
	 */
	protected _high = 0;

	/**
	 * The index of the current lowest value in the wave cycle capture.
	 */
	protected _low = 0;

	/**
	 * The wave cycles of the current capture.
	 */
	protected _cycles: Cycle[] = [];

	/**
	 * @param dataArray - The data array of wave cycle frames to analyze.
	 */
	constructor(dataArray: Float32Array) {
		this._dataArray = dataArray;
	}

	/**
	 * Analyze an audio wave time domain data array to find useful indexes of cycle phases.
	 *
	 * Intended for analyzing data from an `AnalyserNode`.
	 *
	 * @param limit - Optional argument to limit the number of cycles analyzed in the data array.
	 * @returns An array of records containing important indexes pointing to the wave cycle frames in the dataArray.
	 * @public
	 */
	analyze(limit?: number): Cycle[] {
		// Don't take the time to analyze an empty data array.
		if (!this._dataArray.some((frame) => frame !== 0)) {
			this._cycles = [];
			return this.cycles;
		}

		// Reset analyzer state.
		this._cycles = [];
		this._frame = 0;
		this._previous = 0;
		this._start = -1;

		const length = this._dataArray.length;

		for (let pos = 0; pos < length; pos++) {
			const frame = this._dataArray[pos];

			// Save references to variables for analyzer methods.
			this._pos = pos;
			this._frame = frame;

			// If we are at the start of the data array there isn't enough data to analyze yet.
			if (pos === 0) {
				this._previous = frame;
				continue;
			}

			/**
			 * The transition points of the cycle are not always on 0, I will need to figure that out.
			 * * EDIT: I figured it out and the logic is in the renderer. To compensate for
			 * * the difference, it shifts the x axis to align the waves after calculating
			 * * exact zero between the points returned by this function.
			 */
			if (this._isCrossing()) {
				if (frame >= 0) {
					if (this._isFinished()) {
						const end = pos - 1;
						const cycle = { start: this._start, end, high: this._high, low: this._low };

						this._cycles.push(cycle);
						this._bufferPrevState();

						if (limit && this._cycles.length === limit) {
							return this.cycles;
						}

						this._start = pos;
					} else if (this._start === -1) {
						// The starting the initial cycle of this analysis run.
						this._start = pos;
					}
				}
				// On the downward slope, the positive to negative transition point.
				// ? I don't think this needs to be recorded 🤔
			}

			this._analyzeSlope();

			this._previous = frame;
		}

		return this.cycles;
	}

	/**
	 * @param data - Data array from AnalyserNode#getFloatTimeDomainData
	 * @param width - Width of the canvas element.
	 * @param height - Height of the canvas element.
	 */
	calcPoints(width: number, height: number): [number, number][] {
		const waveIndexes = this.analyze();
		if (waveIndexes.length === 0) return [];

		const points: [number, number][] = [];

		// TODO this seems pretty optimistic, should do some validation.
		const indexOffset = waveIndexes[1].start;
		const segmentWidth = width / FRAMES;

		// Looking back one data point to calculate the first point of the line,
		// and also calculate the `xOffset` because the waves typically are not
		// right on zero.
		const data1 = this._dataArray[indexOffset - 1];
		const data2 = this._dataArray[indexOffset];

		// If data1 isn't negative this will be really wrong.
		// But it should be 🤞
		const ratio = data2 / (Math.abs(data1) + data2);

		const x1 = 0;
		const y1 = data1 * height + height / 2;
		const x2 = segmentWidth;
		const y2 = data2 * height + height / 2;
		const m = (y2 - y1) / (x2 - x1);

		const y3 = (y2 - y1) * ratio + y1;

		const xOffset = Math.abs((y2 - y3) / m - x2);

		// The first point is off canvas
		points.push([xOffset - segmentWidth, y1]);

		for (let i = 0; i < FRAMES; i++) {
			const x = i * segmentWidth + xOffset;
			const v = this._dataArray[i + indexOffset];
			const y = v * height + height / 2;
			points.push([x, y]);
		}

		// The last point is off canvas
		const x4 = FRAMES * segmentWidth + xOffset;
		const y4 = this._dataArray[indexOffset + FRAMES] * height + height / 2;
		points.push([x4, y4]);

		return points;
	}

	public get cycles(): Cycle[] {
		return [...this._cycles];
	}

	/**
	 * Analyze the current slope and update the `_high` or `_low` state if necessary.
	 */
	private _analyzeSlope() {
		if (this._frame >= 0 && this._frame > this._previous) {
			this._high = this._pos;
		} else if (this._frame < 0 && this._frame < this._previous) {
			this._low = this._pos;
		}
	}

	private _bufferPrevState() {
		this._prevCycleWidths = push(this._cycleWidth(), this._prevCycleWidths);
		this._prevCycleHeights = push(this._cycleHeight(), this._prevCycleHeights);
	}

	/**
	 * The difference between the values in the `_dataArray` at the `_high` and `_low` indexes.
	 */
	private _cycleHeight(): number {
		return this._dataArray[this._high] + Math.abs(this._dataArray[this._low]);
	}

	/**
	 * The number of index positions between the `_start` of the current capture and the
	 * current position.
	 */
	private _cycleWidth(): number {
		return this._pos - this._start;
	}

	private _isCrossing(): boolean {
		if ((this._frame >= 0 && this._previous < 0) || (this._frame < 0 && this._previous >= 0)) {
			return true;
		}
		return false;
	}

	private _isFinished(): boolean {
		if (this._start && this._high && this._low) {
			// The cycle can cross zero before completing, this condition is an attempt
			// to prevent false wave cycle captures. The logic is that changes to the
			// amplitude of the cycle will probably be gradual.
			if (
				this._cycleWidth() > average(this._prevCycleWidths) * 0.9 ||
				this._cycleHeight() > average(this._prevCycleHeights) * 0.9
			) {
				return true;
			}
		}
		return false;
	}
}

/**
 * Utility match function.
 *
 * @internal
 */
function average(array: number[]): number {
	const length = array.length;

	// This prevents a zero divide by zero situation.
	if (length === 0) return 0;

	const values = array;
	let sum = 0;

	for (let i = 0; i < length; i++) {
		sum = sum + values[i];
	}

	return sum / length;
}

/**
 * Utility array function.
 *
 * Doesn't limit arrays that are larger than the limit, but it shouldn't overflow if
 * this function is always used to push values.
 * @internal
 */
function push(value: number, array: number[], limit = 10): number[] {
	if (array.length === limit) {
		const [, ...tail] = array;
		return [...tail, value];
	}

	return [...array, value];
}
