const fs = require("fs");
const path = require("path");

exports.siblingLibPlugin = {
  name: "sibling lib plugin",
  setup(build) {
    // redirect and mark as external all use of lib-node.js and lib-web.js
    build.onResolve(
      { filter: /[.]\/(lib-(node|web)[.](js|data|wasm))/ },
      (args) => {
        const parts = args.path.split(path.sep);
        if (
          !args.importer.includes("es-web.ts") &&
          !args.importer.includes("es-node.ts")
        ) {
          return;
        }
        return {
          path: [".", parts[parts.length - 1]].join(path.sep),
          external: true,
        };
      }
    );
  },
};

exports.copyAll = (srcDir, destDir, prefix) => {
  for (const entry of fs.readdirSync(srcDir)) {
    if (entry.startsWith(prefix)) {
      const src = path.join(srcDir, entry);
      const dest = path.join(destDir, entry);
      fs.copyFileSync(src, dest);
      console.log(src, "->", dest);
    }
  }
};
