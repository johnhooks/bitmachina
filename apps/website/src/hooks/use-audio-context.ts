import { useRef } from "react";

export function useAudioContext(): AudioContext {
	const audioContextRef = useRef<AudioContext | null>(null);

	const getAudioContext = (): AudioContext => {
		if (audioContextRef.current) {
			return audioContextRef.current;
		} else {
			const audioContext = new AudioContext();
			audioContextRef.current = audioContext;
			return audioContext;
		}
	};

	return getAudioContext();
}
