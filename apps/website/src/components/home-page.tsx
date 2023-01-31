import { Audio } from "../contexts/audio.js";
import { useAudioContext } from "../hooks/use-audio-context.js";

import { ScopeExample } from "./scope-example.js";

export function HomePage() {
	const audioContext = useAudioContext();
	return (
		<Audio.Provider value={audioContext}>
			<ScopeExample width={256} height={256} />
		</Audio.Provider>
	);
}
