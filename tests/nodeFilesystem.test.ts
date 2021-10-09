import {
  nodeLoadedEsLib,
  libFactory,
} from "endless-sky-bindings/dist/es-node.js";
import { fileURLToPath } from "url";
import * as assert from "assert";
import * as path from "path";

import * as tap from "tap";
// node-tap runs tests in separate processes already: so as long as we only load es data
// once per file, we should be good.

// With the node filesystem, there's one build (built with Linux IFDEFS I think?) instead of three
// like normal Endless Sky. This means we're missing important Windows file handling code.

// @ts-ignore
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const examplePlugin = path.join(__dirname, "./exampleplugin");

(async () => {
  const esLib = await libFactory();

  tap.test("FilesRecursiveList", (t) => {
    // relative to the node cwd location?
    const files = esLib.FilesRecursiveList("exampleplugin");
    assert.strictEqual(files.toArr().length > 0, true);
    assert.strictEqual(
      files.toArr().includes("exampleplugin/data/ships.txt"),
      true
    );
    t.end();
  });
  tap.test("FilesList", (t) => {
    // relative to the node cwd location?
    const files = esLib.FilesList(".");
    assert.strictEqual(files.toArr().length > 2, true);
    t.end();
  });
  tap.test("FilesListDirectories", (t) => {
    const files = esLib.FilesListDirectories(".");
    assert.strictEqual(files.toArr().length > 0, true);
    assert.strictEqual(files.toArr().includes("./exampleplugin/"), true);
    t.end();
  });
})();

(async () => {
  const esLib = await nodeLoadedEsLib({
    pluginDir: examplePlugin,
  });

  tap.test("Normal code works", (t) => {
    const account = new esLib.Account();
    assert.deepEqual(account.Credits(), 0);
    account.AddCredits(100);
    assert.deepEqual(account.Credits(), 100);
    t.end();
  });

  tap.test("Plugin is loaded", (t) => {
    console.log(esLib.GameDataShips());
    console.log(esLib.GameDataShips().Get("Canoe"));
    const ships = esLib.GameDataShips().toObj();
    assert.deepStrictEqual([...Object.keys(ships)], ["Canoe"]);
    const canoe = ships["Canoe"];
    assert.strictEqual(canoe.ModelName(), "Canoe");
    t.end();
  });
})();
