JavaScript bindings for Endless Sky CPP code.

~~~
import libFactory from "../endless-sky-bindings/index.mjs";

(async function () {
  const esLib = await libFactory();
  console.log(new esLib.Point(1, 2));
})();
~~~
