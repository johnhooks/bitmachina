import { createContext, useContext } from "react";

/**
 * This is confusing because of `AudioContext`.
 */
export const Audio = createContext<AudioContext | null>(null);

export const useAudio = () => {
	const audio = useContext(Audio);

	if (!audio) {
		throw new Error("useAudio has to be used within <Audio.Provider>");
	}

	return audio;
};
