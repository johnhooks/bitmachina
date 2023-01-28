import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["packages/*/tests/**/*.{test,spec}.{js,mjs,cjs,ts}"],
		globals: true,
		environment: "jsdom",
		setupFiles: ["./setupTests.js"],
	},
});
