import { analyze } from "../src/analyze.js";

import * as waves from "./mock/waves.js";

describe("analyze", () => {
	describe("simple saw wave", () => {
		it("should return waves cycle start indexes", () => {
			const result = analyze(waves.simpleSawWaveFloatData);
			expect(result).toEqual([3, 10]);
		});
	});
	describe("sine wave", () => {
		it("should return waves cycle start indexes", () => {
			const result = analyze(waves.sineWaveFloatData);
			expect(result).toEqual([8, 108]);
		});
	});
});
