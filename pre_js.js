// if isNode, override locateFiles
if (typeof process !== "undefined" && process?.versions?.node) {
  Module.locateFile = function (pth) {
    const url = new URL(`./${pth}`, import.meta.url);
    return url.toString().replace("file://", "");
  };
}
