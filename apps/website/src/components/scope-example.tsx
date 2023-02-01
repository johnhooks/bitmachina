import { Scope } from "@bitmachina/scope";
import { useState, useEffect, type MouseEventHandler, type ChangeEventHandler } from "react";

import "../styles/scope.css";

import { useAudio } from "../contexts/audio.js";
import {
	useAnalyserNode,
	useBiquadFilterNode,
	useGainNode,
	useOscillatorNode,
} from "../hooks/index.js";

import { Slider } from "./slider.js";

type Props = {
	width: number;
	height: number;
};

export function ScopeExample(props: Props) {
	const [oscType, setOscType] = useState<OscillatorType>("sine");
	const [frequency, setFrequency] = useState(440);
	const [gain, setGain] = useState(0.25);
	const [cutoff, setCutoff] = useState(22050);
	const [resonance, setResonance] = useState(0.0001);
	const [disabled, setDisabled] = useState(true);
	const [gainRampTimeout, setGainRampTimeout] = useState<ReturnType<typeof setTimeout> | null>(
		null
	);

	const audioContext = useAudio();
	const analyserNode = useAnalyserNode({
		smoothingTimeConstant: 1,
		fftSize: 32768,
	});

	const filterNode = useBiquadFilterNode({
		type: "lowpass",
		frequency: cutoff,
		Q: resonance,
	});

	const gainNode = useGainNode({
		gain,
	});

	const oscillatorNode = useOscillatorNode({
		type: oscType,
		frequency,
	});

	useEffect(() => {
		audioContext.suspend();
		oscillatorNode.start();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const handleOscType: ChangeEventHandler<HTMLSelectElement> = (event) => {
		const oscType = event.target.value as OscillatorType;
		oscillatorNode.type = oscType;
		setOscType(oscType);
	};

	const handleFrequency: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		oscillatorNode.frequency.value = value;
		setFrequency(value);
	};

	const handleCutoff: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		filterNode.frequency.value = value;
		setCutoff(value);
	};

	const handleResonance: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		filterNode.Q.value = value;
		setResonance(value);
	};

	const handleGain: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		gainNode.gain.value = value;
		setGain(value);
	};

	const handleToggle: MouseEventHandler<HTMLButtonElement> = () => {
		setDisabled((previous) => {
			const disabled = !previous;
			if (disabled) {
				suspendAudio();
			} else {
				resumeAudio();
			}
			return disabled;
		});
	};

	function resumeAudio() {
		if (gainRampTimeout) {
			clearTimeout(gainRampTimeout);
		} else {
			audioContext.resume();
			oscillatorNode.connect(filterNode);
			filterNode.connect(gainNode);
			gainNode.connect(analyserNode);
			analyserNode.connect(audioContext.destination);
		}
		gainNode.gain.exponentialRampToValueAtTime(gain, audioContext.currentTime + 1);
	}

	function suspendAudio() {
		// Note: A value of 0.01 was used for the value to ramp down to in the last
		// function rather than 0, as an invalid or illegal string error is thrown if
		// 0 is used — the value needs to be positive.
		// https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime#examples
		gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
		setGainRampTimeout(
			setTimeout(() => {
				audioContext.suspend();
				oscillatorNode.disconnect(filterNode);
				filterNode.disconnect(gainNode);
				gainNode.disconnect(analyserNode);
				analyserNode.disconnect(audioContext.destination);
				setGainRampTimeout(null);
			}, 1500)
		);
	}

	return (
		<main className="container">
			<section>
				<header className="heading">
					<h2>Oscilloscope</h2>
				</header>

				<div className="card row">
					<div className="col">
						<div className="scope">
							<Scope
								width={props.width}
								height={props.height}
								analyserNode={analyserNode}
								disabled={disabled}
							/>
						</div>

						<button onClick={handleToggle}>{disabled ? "Turn On" : "Turn Off"}</button>
					</div>

					<form className="col controls">
						<fieldset>
							<legend>Voice Parameters</legend>

							<p>
								<select id="osc-type" onChange={handleOscType} value={oscType}>
									<option value="sine">Sine</option>
									<option value="square">Square</option>
									<option value="sawtooth">Sawtooth</option>
									<option value="triangle">Triangle</option>
								</select>
								<label htmlFor="osc-type" className="sr-only">
									Oscillator Type
								</label>
							</p>

							<p>
								<Slider
									id="frequency"
									label="Frequency"
									min={110}
									max={1760}
									step={1}
									value={frequency}
									onChange={handleFrequency}
									srOnly={`value ${frequency} Hz`}
								/>
							</p>

							<p>
								<Slider
									id="gain"
									label="Input Gain"
									min={0.01}
									max={1}
									step={0.05}
									value={gain}
									onChange={handleGain}
									srOnly={`value ${Math.floor(gain * 100)}`}
								/>
							</p>

							<p>
								<Slider
									id="cutoff"
									label="Filter Cutoff Frequency"
									min={10}
									max={22050}
									step={0.1}
									value={cutoff}
									onChange={handleCutoff}
									srOnly={`value ${cutoff} Hz`}
								/>
							</p>

							<p>
								<Slider
									id="resonance"
									label="Filter Q"
									min={0.0001}
									max={50}
									step={0.0001}
									value={resonance}
									onChange={handleResonance}
									srOnly={`value ${Math.floor(resonance * 100) / 100}`}
								/>
							</p>
						</fieldset>
					</form>
				</div>
			</section>
		</main>
	);
}
