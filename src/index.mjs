/* Universal entry point that should work in node and the browser */

export async function libFactory() {
  let isNode = typeof process !== "undefined" && process?.versions?.node;

  const mod = await module();
  return mod.default();
}
export default libFactory;

export async function loadedEsLib(loadArgs) {
  const mod = await module();
  return mod.loadedEsLib(loadArgs);
}

function module() {
  let isNode = typeof process !== "undefined" && process?.versions?.node;
  if (isNode) {
    return import("./es-node.js");
  } else {
    return import("./es-web.js");
  }
}
