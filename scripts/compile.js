#!/usr/bin/env node

import path from "node:path";
import { fileURLToPath } from "node:url";

import { exec } from "./utils/exec.js";

const rootDir = path.resolve(fileURLToPath(new URL(".", import.meta.url)), "../");
const tscPath = path.join(rootDir, "node_modules/.bin/tsc");

const tscArgs = ["--build", "./src"];

console.log(`tsc ${tscArgs.join(" ")}`);

await exec(tscPath, tscArgs)
	.then(() => {
		process.exit(0);
	})
	.catch((code) => {
		process.exit(code);
	});
