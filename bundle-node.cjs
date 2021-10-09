const { siblingLibPlugin, copyAll } = require("./bundler-plugins.cjs");

console.log("bundling src/es-node.ts -> dist/es-node.ts");
require("esbuild")
  .build({
    entryPoints: ["src/es-node.ts"],
    outfile: "dist/es-node.js",
    bundle: true,
    platform: "node",
    format: "esm",
    external: ["./src/lib-node.js"],
    sourcemap: true,
    plugins: [siblingLibPlugin],
  })
  .then(() => {
    copyAll("src", "dist", "lib-node");
  })
  .catch(() => process.exit(1));
