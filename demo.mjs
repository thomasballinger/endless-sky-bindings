import Module from "./lib-node.mjs";

// eval by any other name is global eval
const geval = eval;

function eg(strings) {
  const src = strings.join("");
  console.log(`>> ${src}`);
  const val = geval(src);
  if (val !== undefined) console.log(val);
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
  eg`account = new esLib.Account();`;
  eg`account.Credits()`;
  eg`account.AddCredits(100)`;
  eg`account.Credits()`;
  eg([
    's = `ship "Shuttle"\n\tsprite "ship/shuttle"\n`; shipNode = esLib.AsDataNode(s);',
  ]);
  eg`shipNode.HasChildren();`;
  eg`shipNode.Size();`;
  eg`shipNode.children().size();`;
  eg`shipNode.children().get(0).Token(0);`;
  eg`shipNode.children().get(0).Token(1);`;

  eg`s = new esLib.Ship(shipNode);`;
  eg`s.ModelName()`;
  eg`s.FlightCheck().get(0)`;
})();
