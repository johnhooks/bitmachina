import { Scope } from "@bitmachina/scope";
import { Component, type MouseEventHandler, type ChangeEventHandler } from "react";

import "../styles/scope.css";

import { Slider } from "../components/slider";

type Props = {
	width: number;
	height: number;
};

type State = {
	oscType: OscillatorType;
	frequency: number;
	gain: number;
	cutoff: number;
	resonance: number;
	disabled: boolean;
};

export class ScopeExample extends Component<Props, State> {
	public state: State = {
		oscType: "sine",
		frequency: 440,
		gain: 0.25,
		cutoff: 22050,
		resonance: 0.0001,
		disabled: true,
	};

	private audioContext = new AudioContext();

	private oscillatorNode = new OscillatorNode(this.audioContext, {
		type: this.state.oscType,
		frequency: this.state.frequency,
	});

	private filterNode = new BiquadFilterNode(this.audioContext, {
		type: "lowpass",
		frequency: this.state.cutoff,
		Q: this.state.resonance,
	});

	private gainNode = new GainNode(this.audioContext, {
		gain: this.state.gain,
	});

	private analyserNode = new AnalyserNode(this.audioContext, {
		smoothingTimeConstant: 1,
		fftSize: 32768,
	});

	private gainRampTimeout: ReturnType<typeof setTimeout> | null = null;

	constructor(props: Props) {
		super(props);
		this.oscillatorNode.start();
	}

	componentWillUnmount(): void {
		this.suspendAudio();
	}

	handleOscType: ChangeEventHandler<HTMLSelectElement> = (event) => {
		const oscType = event.target.value as OscillatorType;
		this.oscillatorNode.type = oscType;
		this.setState(() => {
			return { oscType };
		});
	};

	handleFrequency: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		this.oscillatorNode.frequency.value = value;
		this.setState(() => {
			return { frequency: value };
		});
	};

	handleCutoff: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		this.filterNode.frequency.value = value;
		this.setState(() => {
			return { cutoff: value };
		});
	};

	handleResonance: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		this.filterNode.Q.value = value;
		this.setState(() => {
			return { resonance: value };
		});
	};

	handleGain: ChangeEventHandler<HTMLInputElement> = (event) => {
		const value = parseFloat(event.target.value);
		if (isNaN(value)) return;
		this.gainNode.gain.value = value;
		this.setState(() => {
			return { gain: value };
		});
	};

	handleToggle: MouseEventHandler<HTMLButtonElement> = () => {
		this.setState((state) => {
			const disabled = !state.disabled;
			if (disabled) {
				this.suspendAudio();
			} else {
				this.resumeAudio();
			}
			return { disabled };
		});
	};

	resumeAudio() {
		if (this.gainRampTimeout) {
			clearTimeout(this.gainRampTimeout);
		} else {
			this.audioContext.resume();
			this.oscillatorNode.connect(this.filterNode);
			this.filterNode.connect(this.gainNode);
			this.gainNode.connect(this.analyserNode);
			this.analyserNode.connect(this.audioContext.destination);
		}
		this.gainNode.gain.exponentialRampToValueAtTime(
			this.state.gain,
			this.audioContext.currentTime + 1
		);
	}

	suspendAudio() {
		// Note: A value of 0.01 was used for the value to ramp down to in the last
		// function rather than 0, as an invalid or illegal string error is thrown if
		// 0 is used — the value needs to be positive.
		// https://developer.mozilla.org/en-US/docs/Web/API/AudioParam/exponentialRampToValueAtTime#examples
		this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
		// Need to be able to clear this if it gets re-toggled quickly
		this.gainRampTimeout = setTimeout(() => {
			this.audioContext.suspend();
			this.oscillatorNode.disconnect(this.filterNode);
			this.filterNode.disconnect(this.gainNode);
			this.gainNode.disconnect(this.analyserNode);
			this.analyserNode.disconnect(this.audioContext.destination);
			this.gainRampTimeout = null;
		}, 1500);
	}

	render() {
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
									width={this.props.width}
									height={this.props.height}
									analyserNode={this.analyserNode}
									disabled={this.state.disabled}
								/>
							</div>

							<button onClick={this.handleToggle}>
								{this.state.disabled ? "Turn On" : "Turn Off"}
							</button>
						</div>

						<form className="col controls">
							<fieldset>
								<legend>Voice Parameters</legend>

								<p>
									<select id="osc-type" onChange={this.handleOscType} value={this.state.oscType}>
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
										value={this.state.frequency}
										onChange={this.handleFrequency}
										srOnly={`value ${this.state.frequency} Hz`}
									/>
								</p>

								<p>
									<Slider
										id="gain"
										label="Input Gain"
										min={0.01}
										max={1}
										step={0.05}
										value={this.state.gain}
										onChange={this.handleGain}
										srOnly={`value ${Math.floor(this.state.gain * 100)}`}
									/>
								</p>

								<p>
									<Slider
										id="cutoff"
										label="Filter Cutoff Frequency"
										min={10}
										max={22050}
										step={0.1}
										value={this.state.cutoff}
										onChange={this.handleCutoff}
										srOnly={`value ${this.state.cutoff} Hz`}
									/>
								</p>

								<p>
									<Slider
										id="resonance"
										label="Filter Q"
										min={0.0001}
										max={50}
										step={0.0001}
										value={this.state.resonance}
										onChange={this.handleResonance}
										srOnly={`value ${Math.floor(this.state.resonance * 100) / 100}`}
									/>
								</p>
							</fieldset>
						</form>
					</div>
				</section>
			</main>
		);
	}
}
