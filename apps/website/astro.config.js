import { fileURLToPath } from "node:url";

import react from "@astrojs/react";
import { defineConfig } from "astro/config";

// https://astro.build/config

// https://astro.build/config
export default defineConfig({
	integrations: [react()],
	vite: {
		base: process.env.NODE_ENV === "development" ? "/" : "/bitmachina/",
		resolve: {
			alias: {
				"@bitmachina/scope": fileURLToPath(
					new URL("../../packages/scope/src/index.ts", import.meta.url).href
				),
			},
		},
	},
});
