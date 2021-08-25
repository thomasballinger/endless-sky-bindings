JavaScript bindings for Endless Sky CPP code.

~~~
import libFactory from "../endless-sky-bindings/index.mjs";

(async function () {
  const esLib = await libFactory();
  console.log(new esLib.Point(1, 2));
})();
~~~

---

## Development

This repository has a specific commit of Endless Sky as a submodule. A patch (patch.diff) is applied to it, mostly to make it compile with the Emscripten toolchain. This patch is based on the changes made to Endless Sky in the [Endless Web](https://github.com/thomasballinger/endless-web) fork.

These modified Endless Sky C++ files are compiled with Emscripten with bindings provided by the Emscripten [embind](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html) macros in lib.cpp.
