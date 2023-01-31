import { useRef } from "react";

import { useAudioContext } from "./use-audio-context.js";

export function useGainNode(options: GainOptions): GainNode {
	const audioContext = useAudioContext();
	const ref = useRef<GainNode | null>(null);

	const getInstance = (): GainNode => {
		if (ref.current) {
			return ref.current;
		} else {
			const audioNode = new GainNode(audioContext, options);
			ref.current = audioNode;
			return audioNode;
		}
	};

	return getInstance();
}
