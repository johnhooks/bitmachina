import { useRef } from "react";

import { useAudioContext } from "./use-audio-context.js";

export function useOscillatorNode(options: OscillatorOptions): OscillatorNode {
	const audioContext = useAudioContext();
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
