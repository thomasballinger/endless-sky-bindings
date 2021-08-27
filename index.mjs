export default async function ESlib() {
  let isNode = typeof process !== "undefined" && process?.versions?.node;
  let mod;

  // TODO just use one .mjs file! by fixing https://github.com/emscripten-core/emscripten/issues/11792
  if (isNode) {
    mod = await import("./lib-node.mjs");
    const libFactory = mod.default;
    return await libFactory();
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
    return await libFactory(Module);
  }
}
