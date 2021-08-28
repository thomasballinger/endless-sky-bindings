import esLibFactory, { vecToArray, dictToObject } from "./index.mjs";
import { inspect } from "util";

const OUTPUT_LINES = 10;

// Run some code as though at the repl
async function eg(strings) {
  const src = strings.join("");
  console.log(`>> ${src}`);
  let val;
  if (src.includes("await ")) {
    val = await Object.getPrototypeOf(async function () {}).constructor(
      `return ${src}`
    )();
  } else {
    val = Function(`return ${src}`)();
  }
  if (val === undefined) return;
  const s = inspect(val);
  // don't print imports
  if (s.split("\n").length > OUTPUT_LINES) {
    console.log(
      s.split("\n").slice(0, OUTPUT_LINES).join("\n") + "\n...and more"
    );
  } else console.log(s);
}

(async function () {
  await eg``;
  const esLib = await esLibFactory();
  global.esLib = esLib;
  global.vecToArray = vecToArray;
  global.dictToObject = dictToObject;

  // TODO move to a testing framework and just demo the most interesting stuff here

  // The rest of these examples show all function being used.
  // They all uses the global scope.
  eg`p = new esLib.Point(10, 12); p // create objects with 'new'`;
  eg`x = p.X(); // the C++ methods are usually capitalized`;
  eg`d = new esLib.Dictionary();`;
  eg`d.Set("asdf", 123.123);`;
  eg`d.Get("asdf");`;
  eg`vecToArray(d.keys());`;
  eg`d.toObj();`;
  eg`account = new esLib.Account();`;
  eg`account.Credits()`;
  eg`account.AddCredits(100)`;
  eg`account.Credits()`;
  eg(['simpleNode = esLib.AsDataNode(\n`ship "Shuttle"\n\tkey "value"\n`);']);
  eg`simpleNode.HasChildren();`;
  eg`simpleNode.children().get(0).Token(0);`;

  await eg`fs = await import('fs');`;
  eg`shuttleNode = esLib.AsDataNode(fs.readFileSync('./shuttle-example.txt', 'utf-8'));`;
  eg`shuttleNode.HasChildren();`;
  eg`shuttleNode.children().get(0).Token(0);`;
  eg`shuttleNode.children().get(0).Token(1);`;
  eg`shuttleNode.children().get(1).Token(0);`;
  eg`shuttleNode.children().get(1).Token(1);`;

  eg`s = new esLib.Ship(shuttleNode);`;
  eg`s.ModelName()`;
  eg`s.BaseAttributes().Attributes().toObj()`;
  eg`s.ChassisCost()`;
  eg`s.Cost() // cost won't work yet because outfits aren't loaded`;

  eg`esLib.GameDataBeginLoad() // this takes a second`;
  eg`s.FinishLoading(true);`;
  eg`s.Cost()`;
  eg`s.Attributes().Attributes().toObj()`;
  eg`s.Place(new esLib.Point(0, 0), new esLib.Point(0, 0), new esLib.Angle(0));`;
  eg`s.FlightCheck().size() // an empty vector means ready for takeoff!`;

  eg`aerie = esLib.GameDataShips().Get("Aerie")`;
  eg`aerie.BaseAttributes().Attributes().toObj()`;
  eg`x = esLib.GameDataShips()`;
  eg`x.keys().size()`;
  eg`x.values().size()`;
  eg`x.toObj()`;
})();
