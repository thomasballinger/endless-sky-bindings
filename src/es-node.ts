import * as fs from "fs";
import * as path from "path";
import * as url from "url";
import * as os from "os";
import process from "process";

import * as mod from "./lib-node.js";
import { withPreparedFilesystem } from "./filesystem.js";
import { augmentEsLib, ESLib } from "./augmentlib.js";
import {
  parseCoreDataWithSubprocess,
  parsePluginWithSubprocess,
  parseWithSubprocess,
} from "./linting.js";

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// TODO only works in the repo!
const defaultResources = path.join(__dirname, "endless-sky");

export async function libFactory(): Promise<ESLib> {
  const libFactory = mod.default;
  const esLib = await libFactory();
  return augmentEsLib(esLib);
}
export default libFactory;

// sort of a shim, this isn't the useful way to load things
// but it matches the browser interface
export async function loadedEsLib(loadArgs: string[] = []): Promise<ESLib> {
  const esLib = await libFactory();

  withPreparedFilesystem(
    { resources: defaultResources },
    async ({ config, resources, tmpPlugin }) => {
      // TODO mount node filesystem right here! (if node is to work)
      console.log("resource from withPreparedFilesystem are", resources);
      console.log(resources, fs.existsSync(resources));
      console.log("config from withPreparedFilesystem are", config);
      console.log(config, fs.existsSync(config));
      esLib.GameDataBeginLoad([
        "--resources",
        resources,
        "--config",
        config,
        ...loadArgs,
      ]);
    }
  );
  return esLib;
}

let LOADED = false;

// unimplemented behaviors to match the Python bindings
export const CACHED = Symbol("CACHED"); // download or used downloaded resources
export const FIND = Symbol("FIND"); // look around for a resources dir
export const EMPTY = Symbol("EMPTY"); // create an empty resources or config dir
export const DEFAULT = Symbol("DEFAULT"); // use default config location

type LoadOptions = {
  resources: string | typeof CACHED | typeof FIND | typeof EMPTY;
  config: string | typeof EMPTY;
  pluginDir: string | undefined;
  pluginFile: string | undefined;
};
const defaultOptions: LoadOptions = {
  resources: EMPTY,
  config: EMPTY,
  pluginDir: undefined,
  pluginFile: undefined,
};
export async function nodeLoadedEsLib(
  options?: Partial<LoadOptions>
): Promise<ESLib> {
  if (LOADED) {
    throw new Error(
      "Can't load esLib twice in the same process. Restart node to load."
    );
  }

  options = { ...defaultOptions, ...options };

  let resources: string | undefined;

  if (options.resources === CACHED) {
    // download to some kind of user data directory
    // use exactly the hash this library was built with
    throw new Error("not implemented");
  } else if (options.resources === FIND) {
    // look around the filesystem and find one
    throw new Error("not implemented");
  } else if (options.resources === EMPTY) {
    resources = undefined;
  } else {
    resources = options.resources;
  }

  let config: string | undefined;

  if (options.config === EMPTY) {
    config = undefined;
  } else {
    throw new Error("not implemented");
    //config = options.config;
  }

  if (options.pluginFile) {
    throw new Error("not implemented");
  }

  const esLib = await libFactory();

  return withPreparedFilesystem(
    { resources, pluginDir: options.pluginDir },
    async ({ config, resources, tmpPlugin }) => {
      esLib.GameDataBeginLoad([
        "--resources",
        resources,
        "--config",
        config,
        "-s",
      ]);
      LOADED = true;
      return esLib;
    }
  );
}

const main = async () => {
  if (process.argv[2] === "plugin-load-errors") {
    return console.log(
      JSON.stringify(await parsePluginWithSubprocess(process.argv[3]), null, 2)
    );
  } else if (process.argv[2] === "core-load-errors") {
    return console.log(
      JSON.stringify(
        await parseCoreDataWithSubprocess(process.argv[3]),
        null,
        2
      )
    );
  } else if (process.argv[2] === "load-errors") {
    return console.log(
      JSON.stringify(await parseWithSubprocess(process.argv[3]), null, 2)
    );
  }

  const args = process.argv.slice(2);
  const tmpArgs = args.slice(0);

  let runGame = true;
  let parse = true;
  while (tmpArgs.length) {
    if (tmpArgs[0] == "-s" || tmpArgs[0] == "--ships") {
      runGame = false;
      parse = true;
      tmpArgs.shift();
    } else if (tmpArgs[0] == "-w" || tmpArgs[0] == "--weapons") {
      runGame = false;
      parse = true;
      tmpArgs.shift();
    } else {
      // ignore this argument
      tmpArgs.shift();
    }
  }
  if (runGame) {
    throw new Error("Can't run game yet, not implemented");
  }
  if (parse) {
    const esLib = await libFactory();
    console.log("loaded, now calling GameDataBeginLoad...");
    esLib.GameDataBeginLoad(args);
  }
};
if (process.argv[1] === url.fileURLToPath(import.meta.url)) {
  // The script was run directly.
  main();
}

// reexports for tests - is there a better way to do this? don't bundle?
export * from "./linting.js";
export * from "./plugin.js";
export * from "./filesystem.js";
export * from "./augmentlib.js";
