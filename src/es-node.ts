import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as os from "os";

import * as mod from "./lib-node.mjs";
import { withPreparedFilesystem } from "./filesystem";
import { augmentEsLib, ESLib } from "./augmentlib";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// TODO only works in the repo!
const defaultResources = path.join(__dirname, "endless-sky");

export default async function libFactory(): Promise<ESLib> {
  const libFactory = mod.default;
  const esLib = await libFactory();
  return augmentEsLib(esLib);
}

export async function loadedEsLib(loadArgs: string[]): Promise<ESLib> {
  const esLib = await libFactory();

  withPreparedFilesystem(
    { resources: defaultResources },
    async ({ config, resources, tmpPlugin }) => {
      await esLib.GameDataBeginLoad([
        "--resources",
        resources,
        "--config",
        config,
        ...args,
      ]);
    }
  );
  return esLib;
}
