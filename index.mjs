export default async function ESlib() {
  let isNode = false;
  if (typeof process === "object") {
    if (typeof process.versions === "object") {
      if (typeof process.versions.node !== "undefined") {
        isNode = true;
      }
    }
  }

  let mod;

  // TODO just use one of these
  if (isNode) {
    mod = await import("./lib-node.mjs");
  } else {
    mod = await import("./lib-web.mjs");
  }
  const libFactory = mod.default;
  return await libFactory();
}
