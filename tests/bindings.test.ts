import { libFactory } from "endless-sky-bindings/dist/es-node.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import * as assert from "assert";
import * as fs from "fs";
import * as path from "path";

import * as tap from "tap";

const __dirname = dirname(fileURLToPath(import.meta.url));

const shuttleExample = `ship "Shuttle"
sprite "ship/shuttle"
  "frame time" 4
  "delay" 14
  "random start frame"
thumbnail "thumbnail/shuttle"
attributes
  category "Transport"
  "cost" 180000
  "shields" 500
  "hull" 600
  "required crew" 1
  "bunks" 6
  "mass" 70
  "drag" 1.7
  "heat dissipation" .8
  "fuel capacity" 400
  "cargo space" 20
  "outfit space" 120
  "weapon capacity" 10
  "engine capacity" 60
  weapon
    "blast radius" 12
    "shield damage" 120
    "hull damage" 60
    "hit force" 180
outfits
  "nGVF-AA Fuel Cell"
  "LP036a Battery Pack"
  "D14-RN Shield Generator"
  
  "X2700 Ion Thruster"
  "X2200 Ion Steering"
  "Hyperdrive"
  
engine -6 30
engine 6 30
gun 0 -31
leak "leak" 60 50
explode "tiny explosion" 10
explode "small explosion" 5
description "Although Betelgeuse Shipyards produces other ship models as well, the majority of their profits come from sales of the Shuttle. This versatile ship serves equally well as a passenger transport or a cargo courier. It also happens to be the cheapest ship you can buy which is capable of hyperspace travel."
description \`	Shuttles are not designed to withstand combat of any sort, but they are fast and maneuverable enough to get out of harm's way if attacked by a larger, slower ship. Although they are typically unarmed, they have enough space for one weapon, which is the origin of the popular phrase, "as useless as a blaster cannon on a shuttlecraft."\`
`;

(async () => {
  // this does *not* try to load bundled data
  const esLib = await libFactory();

  tap.test("Account", (t) => {
    const account = new esLib.Account();
    assert.deepEqual(account.Credits(), 0);
    account.AddCredits(100);
    assert.deepEqual(account.Credits(), 100);
    t.end();
  });

  tap.test("Point", (t) => {
    const p = new esLib.Point(10, 12);
    assert.deepEqual(p.X(), 10);
    t.end();
  });

  tap.test("Dictionary", (t) => {
    const d = new esLib.Dictionary();
    d.Set("asdf", 123.123);
    assert.strictEqual(d.Get("asdf"), 123.123);
    assert.deepStrictEqual(d.keys().toArr(), ["asdf"]);
    assert.deepStrictEqual(d.toObj(), { asdf: 123.123 });
    t.end();
  });

  tap.test("DataNode", (t) => {
    const s = `ship "My Ship"\n\tkey "value"\n`;
    const simpleNode = esLib.AsDataNode(s);
    assert.strictEqual(simpleNode.HasChildren(), true);
    assert.strictEqual(simpleNode.children().get(0).Token(0), "key");
    t.end();
  });

  tap.test("Ship", (t) => {
    const shuttleExample = fs.readFileSync(
      path.join(__dirname, "shuttle-example.txt"),
      "utf-8"
    );
    const shuttleNode = esLib.AsDataNode(shuttleExample);
    const s = new esLib.Ship(shuttleNode);
    assert.strictEqual(s.ModelName(), "Shuttle");
    s.BaseAttributes().Attributes().toObj();
    s.ChassisCost();
    assert.strictEqual(s.Cost(), 0);
    t.end();
  });
})();
