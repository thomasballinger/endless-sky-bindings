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
  eg`p = new esLib.Point(10, 12); p`;
  eg`x = p.X();`;
  eg`account = new esLib.Account();`;
  eg`account.Credits()`;
  eg`account.AddCredits(100)`;
  eg`account.Credits()`;
})();
