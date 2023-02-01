import { useRef } from "react";

import { useAudio } from "../contexts/audio.js";

export function useAnalyserNode(options: AnalyserOptions): AnalyserNode {
	const audioContext = useAudio();
	const ref = useRef<AnalyserNode | null>(null);

	const getInstance = (): AnalyserNode => {
		if (ref.current) {
			return ref.current;
		} else {
			const audioNode = new AnalyserNode(audioContext, options);
			ref.current = audioNode;
			return audioNode;
		}
	};

	return getInstance();
}
