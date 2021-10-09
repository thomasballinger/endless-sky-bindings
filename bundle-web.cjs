const { siblingLibPlugin, copyAll } = require("./bundler-plugins.cjs");

console.log("bundling src/es-web.ts -> dist/es-web.ts");
require("esbuild")
  .build({
    entryPoints: ["src/es-web.ts"],
    outfile: "dist/es-web.js",
    bundle: true,
    platform: "browser",
    format: "esm",
    external: ["./src/lib-web.js"],
    sourcemap: true,
    plugins: [siblingLibPlugin],
  })
  .then(() => {
    copyAll("src", "dist", "lib-web");
  })
  .catch(() => process.exit(1));
