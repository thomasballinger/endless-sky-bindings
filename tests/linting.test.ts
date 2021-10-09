import * as assert from "assert";
import * as path from "path";
import { fileURLToPath } from "url";

import {
  nodeLoadedEsLib,
  libFactory,
} from "endless-sky-bindings/dist/es-node.js";

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const defaultResources = path.join(__dirname, "../endless-sky");
const examplePlugin = path.join(__dirname, "./exampleplugin");

import * as tap from "tap";

async () => {
  const esLib = await libFactory();

  tap.test("FilesRecursiveList", (t) => {
    // nop
    t.end();
  });
};
