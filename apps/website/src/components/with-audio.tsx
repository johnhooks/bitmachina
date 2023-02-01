import type { PropsWithChildren } from "react";

import { Audio } from "../contexts/audio.js";
import { useAudioContext } from "../hooks/index.js";

export function WithAudio(props: PropsWithChildren) {
	const audioContext = useAudioContext();
	return <Audio.Provider value={audioContext}>{props.children}</Audio.Provider>;
}
