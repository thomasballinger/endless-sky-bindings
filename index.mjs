export default async function esLib() {
  return loadedEsLib();
}

async function simpleEsLib() {
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
async function augmentedEsLib() {
  return augmentEsLib(await simpleEsLib());
}

async function loadedEsLib() {
  const esLib = await augmentedEsLib();
  await esLib.GameDataBeginLoad(); // this takes a couple seconds`;
  return esLib;
}

// TODO don't expose the whole Emscripten module? Use a proxy?

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
