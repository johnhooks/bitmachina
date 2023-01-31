import { useRef } from "react";

import { useAudio } from "../contexts/audio.js";

export function useOscillatorNode(options: OscillatorOptions): OscillatorNode {
	const audioContext = useAudio();
	const ref = useRef<OscillatorNode | null>(null);

	const getInstance = (): OscillatorNode => {
		if (ref.current) {
			return ref.current;
		} else {
			const audioNode = new OscillatorNode(audioContext, options);
			ref.current = audioNode;
			return audioNode;
		}
	};

	return getInstance();
}
