import type { CSSProperties, HTMLProps } from "react";

import { percent } from "../lib/utils/percent.js";

export type Props = HTMLProps<HTMLInputElement> & {
	id: string;
	label: string;

	min: number;
	max: number;
	value: number;

	srOnly?: string;
};

export function Slider(props: Props) {
	const { id, label, min, max, value, srOnly, ...rest } = props;
	const style = { "--track-fill": `${percent(value, min, max)}%` } as CSSProperties;
	return (
		<>
			<label htmlFor={id}>
				{label}
				{srOnly && <span className="sr-only">{srOnly}</span>}
			</label>
			<input id={id} type="range" min={min} max={max} value={value} style={style} {...rest} />
		</>
	);
}
