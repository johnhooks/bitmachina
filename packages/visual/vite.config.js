import * as path from "path";

import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

export default defineConfig({
	build: {
		lib: {
			entry: path.resolve(__dirname, "src/index.ts"),
			name: "visual",
			formats: ["es"],
		},
		rollupOptions: {
			external: "three",
		},
	},
	plugins: [
		glsl({
			root: "./src",
		}),
	],
});
