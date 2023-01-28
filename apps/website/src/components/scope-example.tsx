import { Scope } from "@bitmachina/scope";
import { useState, useEffect, useMemo, useRef } from "react";

export function ScopeExample() {
	const [disabled, setDisabled] = useState(true);
	const [frequency, setFrequency] = useState(440);
	const [gain, setGain] = useState(0.5);
	const [type, setType] = useState<OscillatorType>("sine");

	const audioContext = useRef(new AudioContext());

	const oscillator = useMemo<OscillatorNode>(() => {
		const oscillator = new OscillatorNode(audioContext.current, {
			type,
			frequency,
		});
		oscillator.start();
		return oscillator;
	}, [type]); // eslint-disable-line react-hooks/exhaustive-deps

	const analyserNode = useMemo<AnalyserNode>(() => {
		return new AnalyserNode(audioContext.current, {
			smoothingTimeConstant: 1,
			fftSize: 32768,
		});
	}, []);

	const gainNode = useMemo<GainNode>(() => {
		return new GainNode(audioContext.current, {
			gain,
		});
	}, [gain]);

	useEffect(() => {
		if (!oscillator || !gainNode || !analyserNode) return;

		const context = audioContext.current;
		oscillator.connect(gainNode);
		gainNode.connect(analyserNode);
		analyserNode.connect(audioContext.current.destination);

		return () => {
			oscillator.disconnect(gainNode);
			gainNode.disconnect(analyserNode);
			analyserNode.disconnect(context.destination);
		};
	}, [oscillator, analyserNode, gainNode]);

	const width = 512;
	const height = 256;

	function handleToggle() {
		setDisabled((disabled) => {
			const off = !disabled;
			if (off) {
				audioContext.current.suspend();
				console.log("audio suspended");
			} else {
				audioContext.current.resume();
				console.log("audio resumed");
			}
			return off;
		});
	}

	return (
		<>
			<div id="controls">
				<button id="on-off" onClick={handleToggle}>
					{disabled ? "Turn On" : "Turn Off"}
				</button>
				<div id="led"></div>

				<label htmlFor="osc-type">Oscillator Type</label>
				<select
					id="osc-type"
					onChange={(event) => {
						setType(event.target.value as OscillatorType);
					}}
					value={type}
				>
					<option value="sine">Sine</option>
					<option value="square">Square</option>
					<option value="sawtooth">Sawtooth</option>
					<option value="triangle">Triangle</option>
				</select>

				<label htmlFor="frequency">
					Frequency: <span id="frequencyValue">440</span>
				</label>
				<input
					id="frequency"
					type="range"
					min="110"
					max="1760"
					step="1"
					value={frequency}
					onChange={(event) => {
						const frequency = parseInt(event.target.value);
						oscillator.frequency.value = frequency;
						setFrequency(parseInt(event.target.value));
					}}
				/>

				<label htmlFor="gain">
					Input Gain: <span id="gainValue">0.5</span>
				</label>
				<input
					id="gain"
					type="range"
					min="0"
					max="1"
					step="0.05"
					value={gain}
					onChange={(event) => {
						setGain(parseFloat(event.target.value));
					}}
				/>

				{/* <label htmlFor="zoom">
					Zoom: <span id="zoomValue">1</span>
				</label>
				<input id="zoom" type="range" min="1" max="256" step="1" value="1" /> */}
			</div>
			<Scope width={width} height={height} analyser={analyserNode} disabled={disabled} />
		</>
	);
}
