export default async function esLib(loadArgs = []) {
  return loadedEsLib(loadArgs);
}

export async function simpleEsLib() {
  let isNode = typeof process !== "undefined" && process?.versions?.node;
  let mod;

  // TODO just use one .mjs file! by fixing https://github.com/emscripten-core/emscripten/issues/11792
  if (isNode) {
    mod = await import("./lib-node.mjs");
    const libFactory = mod.default;
    return libFactory();
  } else {
    mod = await import("./lib-web.mjs");
    const libFactory = mod.default;
    const url = new URL(`./lib-web.data`, import.meta.url);
    const ab = await (await fetch(url)).arrayBuffer();
    const Module = {
      getPreloadedPackage: function (remotePackageName, remotePackageSize) {
        return ab;
      },
    };
    return libFactory(Module);
  }
}

// Things like a ship's attributes can't be calculated until loading finishes
// if the ships has outfits.
export async function augmentedEsLib() {
  return augmentEsLib(await simpleEsLib());
}

export async function loadedEsLib(args) {
  const esLib = await augmentedEsLib();
  const isNode = typeof process !== "undefined" && process?.versions?.node;
  if (isNode) {
    const fs = await import("fs");
    const path = await import("path");
    const url = await import("url");
    const os = await import("os");

    const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

    // TODO this will only work in this repo here
    const resources = path.join(__dirname, "endless-sky");

    // TODO replace with WithPreparedFilesystem or something
    //
    const configDir = fs.mkdtempSync(path.join(os.tmpdir(), "config-"));
    fs.mkdirSync(path.join(configDir, "saves"));
    fs.mkdirSync(path.join(configDir, "plugins"));
    try {
      await esLib.GameDataBeginLoad([
        "--resources",
        resources,
        "--config",
        configDir,
        ...args,
      ]);
    } finally {
      fs.rmdirSync(configDir, { recursive: true });
    }
  } else {
    // In the browser, use
    await esLib.GameDataBeginLoad([
      "--resources",
      "/",
      "--config",
      "/",
      ...args,
    ]); // this takes a couple seconds`;
  }
  return esLib;
}

function augmentEsLib(esLib) {
  esLib.Dictionary.prototype.toObj = function () {
    return dictToObject(this);
  };
  for (const key of Object.keys(esLib).filter((k) => k.endsWith("Vec"))) {
    esLib[key].prototype.toArr = function () {
      return vecToArray(this);
    };
  }
  for (const key of Object.keys(esLib).filter((k) => k.startsWith("SetOf"))) {
    esLib[key].prototype.toObj = function () {
      return dictToObject(this);
    };
  }
  for (const key of Object.keys(esLib).filter((k) => k.endsWith("Map"))) {
    esLib[key].prototype.toObj = function () {
      return dictToObject(this);
    };
  }
  esLib.GameDataBeginLoad = function GameDataBeginLoad(args) {
    const arr = new esLib.StringVec();
    arr.push_back("progname");
    for (const arg of args) {
      console.log("arr.push_back(", arg);
      arr.push_back(arg);
    }
    console.log("arr.size() from js:", arr.size());
    return esLib._GameDataBeginLoad(arr);
  };
  return esLib;
}

export function vecToArray(vector) {
  const arr = [];
  for (let i = 0; i < vector.size(); i++) {
    arr.push(vector.get(i));
  }
  return arr;
}
// Dictionary or Set or std::map
export function dictToObject(dict) {
  const keysVec = dict.keys();
  const valuesVec = dict.values();
  const obj = {};
  for (let i = 0; i < keysVec.size(); i++) {
    obj[keysVec.get(i)] = valuesVec.get(i);
  }
  return obj;
}
