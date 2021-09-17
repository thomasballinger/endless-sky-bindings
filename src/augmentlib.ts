import { ESLibRaw, EsSet } from "./lib.js";

// TODO dont' divide these like this, just include everything
// in the types
export type ESLib = ESLibRaw & {
  GameDataBeginLoad(args: string[]): boolean;
}

export function augmentEsLib(esLib: any): ESLib {
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
  esLib.GameDataBeginLoad = function GameDataBeginLoad(args: string[]) {
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

type Vector<T> = {
  size(): number;
  get(i: number): T;
};

export function vecToArray<T>(vector: Vector<T>): T[] {
  const arr = [];
  for (let i = 0; i < vector.size(); i++) {
    arr.push(vector.get(i));
  }
  return arr;
}

// Dictionary or Set or std::map
export function dictToObject<T>(dict: EsSet<T>): Record<string, T> {
  const keysVec = dict.keys();
  const valuesVec = dict.values();
  const obj: Record<string, T> = {};
  for (let i = 0; i < keysVec.size(); i++) {
    obj[keysVec.get(i)] = valuesVec.get(i);
  }
  return obj;
}
