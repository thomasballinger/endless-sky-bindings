/* Universal entry point that should work in node and the browser */

export default async function libFactory() {
  let isNode = typeof process !== "undefined" && process?.versions?.node;

  const mod = await module();
  return mod.default();
}

export async function loadedEsLib(loadArgs) {
  const mod = await module();
  return mod.loadedEsLib(loadArgs);
}

function module() {
  let isNode = typeof process !== "undefined" && process?.versions?.node;
  if (isNode) {
    return import("./es-node.mjs");
  } else {
    return import("./es-web.mjs");
  }
}
