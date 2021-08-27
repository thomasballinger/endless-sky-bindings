// if isNode, override locateFils
if (typeof process !== "undefined" && process?.versions?.node) {
  Module.locateFile = function (pth) {
    if (pth === "lib-node.wasm") pth = "lib-web.wasm";
    if (pth === "lib-node.data") pth = "lib-web.data";
    const url = new URL(`./${pth}`, import.meta.url);
    return url.toString().replace("file://", "");
  };
}
