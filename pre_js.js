// if isNode, override locateFils
if (typeof process !== "undefined" && process?.versions?.node) {
  Module.locateFile = function (pth) {
    if (pth === "lib-node.wasm") pth = "lib-web.wasm";
    const url = new URL(`./${pth}`, import.meta.url);
    return url.toString().replace("file://", "");
  };
}
