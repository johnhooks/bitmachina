type ResizeListener = (data: { width: number; height: number }) => void;

/**
 * Class representing a canvas element.
 */
export class FullscreenCanvas {
	canvas: HTMLCanvasElement;

	context: CanvasRenderingContext2D;

	width = 0;
	height = 0;
	pixelWidth = 0;
	pixelHeight = 0;
	pixelRatio = window.devicePixelRatio === 2 ? 2 : 1; // TODO pixel ratio can different values than just these two.
	onresize: ((width: number, height: number) => void) | undefined;

	/**
	 * @param parent
	 */
	constructor(parent: HTMLElement) {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d"); // TODO this is using the 2d context!

		canvas.id = "fullscreen";
		parent.appendChild(canvas);

		if (!context) {
			throw new Error("browser does not support canvas rendering");
		}

		this.canvas = canvas;
		this.context = context;

		this.resize();

		window.addEventListener("resize", () => {
			this.resize();
			if (this.onresize !== undefined) {
				this.onresize(this.width, this.height);
			}
		});
	}

	/**
	 * Resize the canvas to fit the window.
	 */
	resize() {
		const width = window.innerWidth;
		const height = window.innerHeight;
		const pixelWidth = width * this.pixelRatio;
		const pixelHeight = height * this.pixelRatio;

		// Set canvas size and adjust for high res displays using jqueryMap references
		this.canvas.setAttribute("width", String(pixelWidth));
		this.canvas.setAttribute("height", String(pixelHeight));

		// Resize of style is the same despite scale
		this.canvas.style.width = width + "px";
		this.canvas.style.height = height + "px";

		// Configuring the canvas resets the context somehow
		this.context.scale(this.pixelRatio, this.pixelRatio);

		this.width = width;
		this.height = height;
		this.pixelWidth = pixelWidth;
		this.pixelHeight = pixelHeight;
	}
}

/**
 * Interface for classes that represent a resizer.
 *
 * @interface
 */
export abstract class Resize {
	protected _width = 0;

	protected _height = 0;

	onresize: ResizeListener | undefined;

	/**
	 * Implementation required
	 */
	abstract dispose(): void;

	public get width(): number {
		return this._width;
	}

	get height(): number {
		return this._height;
	}
}

/**
 * Class to observe window resize.
 * @implements {Resize}
 */
export class WindowResizeObserver extends Resize {
	constructor() {
		super();

		window.addEventListener("resize", this.handleResize);
	}

	handleResize = () => {
		this._width = window.innerWidth;
		this._height = window.innerHeight;
		if (this.onresize !== undefined) {
			this.onresize({ width: this.width, height: this.height });
		}
	};

	dispose = () => {
		window.removeEventListener("resize", this.handleResize);
	};
}

/**
 * Class to observe element resize.
 */
export class ElementResizeObserver extends Resize {
	private _element: HTMLElement;

	private _resizeObserver: ResizeObserver;

	/**
	 * @param element - The element to observe for resize.
	 */
	constructor(element: HTMLElement) {
		super();

		this._element = element;

		// TODO allow selection of just one direction to observe
		this._height = element.getBoundingClientRect().height;
		this._width = element.getBoundingClientRect().width;

		const observer: ResizeObserverCallback = (entries) => {
			const entry = entries[0];

			if (entry.contentBoxSize) {
				// Firefox implements `contentBoxSize` as a single content rect, rather than an array
				const contentBoxSize = Array.isArray(entry.contentBoxSize)
					? entry.contentBoxSize[0]
					: entry.contentBoxSize;

				this._width = contentBoxSize.inlineSize;
				this._height = contentBoxSize.blockSize;
			} else {
				this._width = entry.contentRect.width;
				this._height = entry.contentRect.height;
			}

			if (this.onresize !== undefined) {
				this.onresize({ width: this._width, height: this._height });
			}
		};

		this._resizeObserver = new ResizeObserver(observer);

		this._resizeObserver.observe(element);
	}

	dispose = () => {
		this._resizeObserver.unobserve(this._element);
	};
}
