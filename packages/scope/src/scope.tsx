import { useEffect, useRef, useState } from "react";

import { calcPoints } from "./calc-points.js";

type Props = {
	analyser: AnalyserNode;
	disabled?: boolean;

	width: number;
	height: number;

	fill?: string;
	stroke?: string;
};

export function Scope({
	analyser,
	disabled = false,
	width,
	height,
	fill = "#181818",
	stroke = "#f2f2f2",
}: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!initialized && canvas) {
			console.log("initialize canvas");
			initialize(canvas);
			setInitialized(true);
		}
	}, [canvasRef, initialized]);

	useEffect(() => {
		console.log("configure canvas");
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		if (!context) return;
		configure({ canvas, context, fill, stroke });
	}, [canvasRef, fill, stroke]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const context = canvas.getContext("2d");
		if (!context) throw new Error("Unable to initialize canvas context");

		// Should handle if `frequencyBinCount` changes.
		const dataArray = new Float32Array(analyser.frequencyBinCount);

		// This is just to create a reference we can use in the cleanup callback
		const running = { value: !disabled };

		const runUntilDisabled = () => {
			analyser.getFloatTimeDomainData(dataArray);
			render(canvas, context, dataArray);
			if (!running.value) return;
			requestAnimationFrame(runUntilDisabled);
		};

		runUntilDisabled();

		return () => {
			running.value = false;
		};
	}, [analyser, canvasRef, disabled]);

	return <canvas ref={canvasRef} width={width} height={height}></canvas>;
}

function render(
	canvas: HTMLCanvasElement,
	context: CanvasRenderingContext2D,
	dataArray: Float32Array
): void {
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
}

function configure({
	canvas,
	context,
	fill,
	stroke,
}: {
	canvas: HTMLCanvasElement;
	context: CanvasRenderingContext2D;
	fill: string;
	stroke: string;
}): void {
	// Canvas styling
	context.fillStyle = fill;
	context.strokeStyle = stroke;
	context.lineWidth = 4;

	// Draw the initial empty wave form.
	context.fillRect(0, 0, canvas.width, canvas.height);
	context.beginPath();
	context.moveTo(0, canvas.height / 2);
	context.lineTo(canvas.width, canvas.height / 2);
	context.stroke();
}

function initialize(canvas: HTMLCanvasElement) {
	const pixelRatio = window.devicePixelRatio;

	// Adjust canvas sizing to account for `pixelRatio`
	canvas.width = canvas.width * pixelRatio;
	canvas.height = canvas.height * pixelRatio;
	canvas.style.width = canvas.width / pixelRatio + "px";
	canvas.style.height = canvas.height / pixelRatio + "px";
}
