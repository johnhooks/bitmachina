import { calcPoints } from "./calc-points.js";

const defaultWidth = 512;
const defaultHeight = 256;

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

	public render(dataArray: Float32Array): void {
		const canvas = this._canvas;
		const context = this._context;

		context.fillRect(0, 0, canvas.width, canvas.height);
		context.beginPath();

		const [start, ...rest] = calcPoints({
			data: dataArray,
			width: canvas.width,
			height: canvas.height,
		});

		context.moveTo(...start);

		for (const point of rest) {
			context.lineTo(...point);
		}

		context.stroke();

		this._lastRender = window.performance.now();
	}

	public resize(width: number, height: number): void {
		this._width = width;
		this._height = height;
		this._resize();
	}

	/**
	 * Adjust canvas sizing to account for `pixelRatio`
	 */
	private _resize(): void {
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
		// Resize canvas
		this._resize();
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
				this._resize();
			}
		} else if (name === "height") {
			const value = parseInt(newValue);
			if (!isNaN(value)) {
				this._height = value;
				this._resize();
			}
		} else if (name === "fill") {
			this._context.fillStyle = newValue;
		} else if (name === "stroke") {
			this._context.fillStyle = newValue;
		}

		this._redraw();
	}
}
