// These were necessary for TypeScript to understand the transform that
// `vite-plugin-glsl` does.

declare module "*.glsl" {
	const shader: string;
	export default shader;
}

declare module "*.frag" {
	const shader: string;
	export default shader;
}

declare module "*.vert" {
	const shader: string;
	export default shader;
}
