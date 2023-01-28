export function* indexes(offset: number, length: number, take: number) {
	for (let i = 0; i < take; i++) {
		if (offset === length) offset = 0;
		yield [i, offset++];
	}
}
