import { Scope } from "@bitmachina/scope";
import { useEffect, useMemo, useRef, useState } from "react";

export function ScopeExample() {
	const [disabled, setDisabled] = useState(true);
	const [frequency, setFrequency] = useState(440);
	const [gain, setGain] = useState(0.5);
	const [cutoff, setCutoff] = useState(22050);
	const [resonance, setResonance] = useState(0.0001);
	const [type, setType] = useState<OscillatorType>("sine");

	const audioContext = useRef(new AudioContext());

	const osc = useRef( new OscillatorNode(audioContext.current, {
		type,
		frequency,
	}))


	useEffect(() => {
		audioContext.current.suspend();
	}, []);

	const oscillator = useMemo<OscillatorNode>(() => {
		const oscillator = new OscillatorNode(audioContext.current, {
			type,
			frequency,
		});
		oscillator.start();
		return oscillator;
	}, [type]); // eslint-disable-line react-hooks/exhaustive-deps

	const filterNode = useMemo<BiquadFilterNode>(() => {
		return new BiquadFilterNode(audioContext.current, {
			type: "lowpass",
			frequency: cutoff,
			Q: resonance,
		});
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const gainNode = useMemo<GainNode>(() => {
		return new GainNode(audioContext.current, {
			gain,
		});
	}, [gain]);

	const analyserNode = useMemo<AnalyserNode>(() => {
		return new AnalyserNode(audioContext.current, {
			smoothingTimeConstant: 1,
			fftSize: 32768,
		});
	}, []);

	useEffect(() => {
		if (!disabled) {
			const context = audioContext.current;

			oscillator.connect(filterNode);
			filterNode.connect(gainNode);
			gainNode.connect(analyserNode);
			analyserNode.connect(audioContext.current.destination);
			context.resume();
			console.log("audio resumed");

			return () => {
				context.suspend();
				oscillator.disconnect(filterNode);
				filterNode.disconnect(gainNode);
				gainNode.disconnect(analyserNode);
				analyserNode.disconnect(context.destination);
				console.log("audio suspended");
			};
		}
	}, [disabled]); // eslint-disable-line react-hooks/exhaustive-deps

	const width = 512;
	const height = 256;

	function handleToggle() {
		setDisabled((disabled) => !disabled);
	}

	return (
		<>
			<Scope width={width} height={height} analyserNode={analyserNode} disabled={disabled} />

			<div id="controls">
				<button id="on-off" onClick={handleToggle}>
					{disabled ? "Turn On" : "Turn Off"}
				</button>
				<div id="led"></div>

				<div>
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
					<label htmlFor="osc-type">Oscillator Type</label>
				</div>

				<div>
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
					<label htmlFor="frequency">
						Frequency: <span id="frequencyValue">{frequency}</span>
					</label>
				</div>

				<div>
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
					<label htmlFor="gain">
						Input Gain: <span id="gainValue">{gain}</span>
					</label>
				</div>

				<div>
					<input
						type="range"
						min="10"
						max="22050"
						step="0.1"
						value={cutoff}
						onChange={(event) => {
							const value = parseInt(event.target.value);
							filterNode.frequency.value = value;
							setCutoff(value);
						}}
					/>
					<label htmlFor="cutoff">Filter cutoff: {cutoff}</label>
				</div>

				<div>
					<input
						type="range"
						min="0.0001"
						max="100"
						step="0.0001"
						value={resonance}
						onChange={(event) => {
							const value = parseFloat(event.target.value);
							filterNode.Q.value = value;
							setResonance(value);
						}}
					/>
					<label htmlFor="resonance">Filter Q: {resonance}</label>
				</div>
			</div>
		</>
	);
}
