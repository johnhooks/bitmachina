import { analyze } from "./analyze.js";

/**
 * TODO Need to do checking to make sure data is actually there before trying to process it.
 */

/**
 * This should eventually be dynamic based on zoom.
 */
const frames = 256;

type CalcPointsParams = {
	data: Float32Array;
	width: number;
	height: number;
};
/**
 * @param data - Data array from AnalyserNode#getFloatTimeDomainData
 * @param width - Width of the canvas element.
 * @param height - Height of the canvas element.
 */
export function calcPoints({ data, width, height }: CalcPointsParams): [number, number][] {
	const points: [number, number][] = [];

	const waveIndexes = analyze(data);
	const indexOffset = waveIndexes[1];
	const segmentWidth = width / frames;

	// Looking back one data point to calculate the first point of the line,
	// and also calculate the `xOffset` because the waves typically are not
	// right on zero.
	const data1 = data[indexOffset - 1];
	const data2 = data[indexOffset];

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

	for (let i = 0; i < frames; i++) {
		const x = i * segmentWidth + xOffset;
		const v = data[i + indexOffset];
		const y = v * height + height / 2;
		points.push([x, y]);
	}

	// The last point is off canvas
	const x4 = frames * segmentWidth + xOffset;
	const y4 = data[indexOffset + frames] * height + height / 2;
	points.push([x4, y4]);

	return points;
}
