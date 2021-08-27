import Module from "./lib-node.mjs";
import { inspect } from "util";

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
  if (s.split("\n").length > 100) return "...";
  console.log(s);
}

(async function () {
  const module = await Module();
  global.esLib = module;

  // This is the normal way to use this library.
  const p = new module.Point(10, 12);

  // The rest of these examples show all function being used.
  // They all uses the global scope.
  eg`p = new esLib.Point(10, 12); p`;
  eg`x = p.X();`;
  eg`d = new esLib.Dictionary();`;
  eg`d.Set("asdf", 123.123);`;
  eg`d.Get("asdf");`;
  eg`toArr = function(vector){
  const arr = [];
  for (let i=0; i<vector.size(); i++) {
    arr.push(vector.get(i));
  }
  return arr;
}`;
  eg`toObj = function(dict){
  const keysVec = dict.keys();
  const valuesVec = dict.values();
  const obj = {};
  for (let i=0; i<keysVec.size(); i++) {
    obj[keysVec.get(i)] = valuesVec.get(i);
  }
  return obj;
}`;
  eg`toArr(d.keys());`;
  eg`toObj(d);`;
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
  eg`toObj(s.BaseAttributes().Attributes())`;
  eg`s.ChassisCost()`;
  eg`s.Cost() // cost won't work yet because outfits aren't loaded`;

  eg`esLib.GameDataBeginLoad() // this takes a second`;
  eg`s.FinishLoading(true);`;
  eg`s.Cost()`;
  eg`toObj(s.Attributes().Attributes())`;
  eg`s.Place(new esLib.Point(0, 0), new esLib.Point(0, 0), new esLib.Angle(0));`;
  eg`s.FlightCheck().size()`;
})();
