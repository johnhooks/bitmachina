/**
 * A record type to index the important positions of the phases of a wave cycle in
 * a data array.
 *
 * @public
 */
export type Cycle = {
	/**
	 * The start index of the cycle in a data array.
	 *
	 * The index points to either 0 or the first value in the positive rising phase.
	 * Note: This is not the zero crossing point, but can be used to find it.
	 */
	readonly start: number;

	/**
	 * The end index of the cycle in a data array.
	 *
	 * The index points to last value in the negative rising phase.
	 * Note: This is not the zero crossing point, but can be used to find it.
	 */
	readonly end: number;

	/**
	 * The index of the first highest value of the cycle in a data array.
	 *
	 * Note: This is not the center of the positive phase.
	 */
	readonly high: number;

	/**
	 * The index of the first lowest value of the cycle in a data array.
	 *
	 * Note: This is not the center of the negative phase.
	 */
	readonly low: number;
};
