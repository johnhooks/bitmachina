#!/usr/bin/env node

import path from "path";

import { copy } from "./utils/index.js";

const fromDir = path.resolve("./build");
const toDir = path.resolve("./dist");

copy(fromDir, toDir, (file) => path.extname(file) === ".js");
