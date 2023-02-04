/**
 * @typedef {import('./types').JsonValue} JsonValue
 * @typedef {import('./types').JsonObject} JsonObject
 */

import fs from "node:fs/promises";

/**
 *
 * @param {string} filePath
 * @returns {Promise<JsonValue | null>}
 */
export async function loadJson(filePath) {
	const raw = await fs.readFile(filePath, { encoding: "utf-8" });
	try {
		/** @type {JsonValue} */
		const value = JSON.parse(raw);
		return value;
	} catch (error) {
		console.error(error);
		return null;
	}
}

/** @type {(value: unknown) => value is JsonObject} */
export const isJsonObject = function (value) {
	return !Array.isArray(value) && value === Object(value);
};