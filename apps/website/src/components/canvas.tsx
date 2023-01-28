import { useEffect, useRef } from "react";

type Props = {
	disabled?: boolean;
	width: number;
	height: number;
	render: (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) => void;
};

export function Canvas({ disabled = false, width, height, render }: Props) {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;

		if (disabled || !canvas) return;

		const context = canvas.getContext("2d");

		if (!context) return;

		const runUntilDisabled = () => {
			render(canvas, context);
			if (disabled) return;
			requestAnimationFrame(runUntilDisabled);
		};

		runUntilDisabled();
	}, [canvasRef, disabled, render]);

	return <canvas ref={canvasRef} width={width} height={height}></canvas>;
}
