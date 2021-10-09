// if isNode, override locateFiles
if (typeof process !== "undefined" && process?.versions?.node) {
  Module.locateFile = function (pth) {
    console.log("calling locateFile on", pth);
    const url = new URL(`./${pth}`, import.meta.url);
    console.log("build a url object", url);
    let fixed = url.toString().replace("file://", "");
    console.log("fixed version is:", fixed);
    const isWin = process.platform === "win32";
    if (isWin) {
      while (fixed[0] === "\\" || fixed[0] === "/") {
        fixed = fixed.slice(1);
      }
      console.log("and now it's:", fixed);
    }
    return fixed;
  };
}
