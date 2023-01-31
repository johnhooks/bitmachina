// import { Analyser } from "./analyser.js";

export class Oscilloscope extends HTMLElement {
	/**
	 * Note: might not be pixel width
	 */
	protected _width = 512;

	/**
	 * Note: might not be pixel height
	 */
	protected _height = 256;

	protected _fill = "#181818";
	protected _stroke = "#f2f2f2";

	protected _initialized = false;
	protected _lastRender = 0;

	private _renderRoot: ShadowRoot;

	private _canvas: HTMLCanvasElement;
	private _context: CanvasRenderingContext2D;

	// private _dataArray: Float32Array | null = null;
	// private _analyser: Analyser | null = null;

	constructor() {
		super();

		const root = this.attachShadow({ mode: "open" });
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");

		if (!context) throw Error("Unable to initialize oscilloscope canvas");

		this._renderRoot = root;

		this._canvas = canvas;
		this._context = context;

		this._update();
		this._clear();
		this._drawFlat();

		this._renderRoot.appendChild(canvas);
	}

	// public connect(analyserNode: AnalyserNode): void {
	// 	this._dataArray = new Float32Array(analyserNode.frequencyBinCount);
	// }

	// public render(dataArray: Float32Array): void {
	// 	const canvas = this._canvas;
	// 	const context = this._context;
	// 	// const analyser = (this._analyser = this._analyser || new Analyser(dataArray)); // TODO, remove hack

	// 	context.fillRect(0, 0, canvas.width, canvas.height);
	// 	context.beginPath();

	// 	const points = analyser.calcPoints(canvas.width, canvas.height);

	// 	if (!points) {
	// 		this._drawFlat();
	// 		return;
	// 	}

	// 	const [start, ...rest] = points;

	// 	context.moveTo(...start);

	// 	for (const point of rest) {
	// 		context.lineTo(...point);
	// 	}

	// 	context.stroke();

	// 	this._lastRender = window.performance.now();
	// }

	public resize(width: number, height: number): void {
		this._width = width;
		this._height = height;
		this._adjustSize();
	}

	/**
	 * Adjust canvas sizing to account for `pixelRatio`
	 */
	private _adjustSize(): void {
		const pixelRatio = window.devicePixelRatio;
		this._canvas.width = this._width * pixelRatio;
		this._canvas.height = this._height * pixelRatio;
		this._canvas.style.width = this._width / pixelRatio + "px";
		this._canvas.style.height = this._height / pixelRatio + "px";
	}

	private _clear(): void {
		this._context.fillRect(0, 0, this._width, this._height);
	}

	private _update() {
		// Canvas styling
		this._context.fillStyle = this._fill;
		this._context.strokeStyle = this._stroke;
		this._context.lineWidth = 4;
		// Adjust the size of the canvas.
		this._adjustSize();
	}

	private _drawFlat() {
		this._context.beginPath();
		this._context.moveTo(0, this._height / 2);
		this._context.lineTo(this._width, this._height / 2);
		this._context.stroke();
	}

	/**
	 * If there doesn't seem to be a render loop running, draw an empty oscilloscope.
	 */
	private _redraw() {
		const diff = window.performance.now() - this._lastRender;
		if (diff > 100) {
			this._clear();
			this._drawFlat();
		}
	}

	public static get observedAttributes(): string[] {
		return ["width", "height", "fill", "stroke"];
	}

	public attributeChangedCallback(name: string, _oldValue: string, newValue: string): void {
		if (name === "width") {
			const value = parseInt(newValue);
			if (!isNaN(value)) {
				this._width = value;
				this._adjustSize();
			}
		} else if (name === "height") {
			const value = parseInt(newValue);
			if (!isNaN(value)) {
				this._height = value;
				this._adjustSize();
			}
		} else if (name === "fill") {
			this._context.fillStyle = newValue;
		} else if (name === "stroke") {
			this._context.fillStyle = newValue;
		}

		this._redraw();
	}
}
