import Module from "./lib-node.mjs";
console.log(Module);
(async function () {
  const module = await Module();
  const p = new module.Point(10, 12);
  console.log(p);
  const x = p.X();
  console.log(x);
})();
