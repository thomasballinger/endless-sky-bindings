import { augmentEsLib, ESLib } from "./augmentlib";
import { Mod } from "./lib";



function module(): Mod {
  // @ts-ignore - this will work when it's bundled (this is a web library)
  const mod = await import("./lib-web.js");
  return mod as Mod;
}

export default async function libFactory(): Promise<ESLib> {
  // @ts-ignore - this will work when it's bundled (this is a web library)
  const mod = await module();
  const libFactory = mod.default
  const url = new URL(`./lib-web.data`, import.meta.url);
  const ab = await (await fetch("" + url)).arrayBuffer();
  const Module = {
    getPreloadedPackage: function (
      remotePackageName: string,
      remotePackageSize: string
    ) {
      return ab;
    },
  };
  const esLib = await libFactory(Module);
  return augmentEsLib(esLib);
}

export async function loadedEsLib(loadArgs: string[]): Promise<ESLib> {
  const esLib = await libFactory();
  const augmented = augmentEsLib(esLib);

  await esLib.GameDataBeginLoad([
    "--resources",
    "/",
    "--config",
    "/",
    ...loadArgs,
  ]); // this takes a couple seconds`;
  return esLib;
}
