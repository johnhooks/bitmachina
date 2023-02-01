import { useRef } from "react";

import { useAudio } from "../contexts/audio.js";

export function useBiquadFilterNode(options: BiquadFilterOptions): BiquadFilterNode {
	const audioContext = useAudio();
	const ref = useRef<BiquadFilterNode | null>(null);

	const getInstance = (): BiquadFilterNode => {
		if (ref.current) {
			return ref.current;
		} else {
			const audioNode = new BiquadFilterNode(audioContext, options);
			ref.current = audioNode;
			return audioNode;
		}
	};

	return getInstance();
}
