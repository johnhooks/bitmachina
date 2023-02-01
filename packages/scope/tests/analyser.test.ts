import { Analyser } from "../src/analyser.js";

import * as waves from "./mock/waves.js";

describe("analyze", () => {
	describe("simple saw wave", () => {
		it("should return waves cycle start indexes", () => {
			const result = new Analyser(waves.simpleSawWaveFloatData).analyze();
			const cycle = result[0];

			expect(cycle.start).toEqual(3);
			expect(cycle.end).toEqual(9);
		});
	});
	describe("sine wave", () => {
		it("should return waves cycle start indexes", () => {
			const result = new Analyser(waves.sineWaveFloatData).analyze();
			const cycle = result[0];

			expect(cycle.start).toEqual(8);
			expect(cycle.end).toEqual(107);
		});
	});
});
