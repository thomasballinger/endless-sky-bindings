// if isNode, override locateFiles
if (typeof process !== "undefined" && process?.versions?.node) {
  Module.locateFile = function (pth) {
    const url = new URL(`./${pth}`, import.meta.url);
    let fixed = url.toString().replace("file://", "");
    const isWin = process.platform === "win32";
    if (isWin) {
      while (fixed[0] === "\\" || fixed[0] === "/") {
        fixed = fixed.slice(1);
      }
    }
    return fixed;
  };
}
