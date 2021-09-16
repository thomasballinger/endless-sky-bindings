# JavaScript bindings for Endless Sky C++ code

Use as a ES6 Module, in node or in the browser with a bundler:
~~~
import esLibFactory from "endless-web-bindings";

(async function() {
  const esLib = await esLibFactory();

  // optional, loads game data which is useful for
  // getting stats of ships with outfits
  esLib.GameDataBeginLoad([]);

  console.log(new esLib.Point(1, 2));
})();
~~~

Use in a browser script tag, without a bundler:

~~~
<script type="module">
(async function() {
  const {default: esLibFactory} = await import('https://unpkg.com/endless-sky-bindings/index.mjs?module');
  const esLib = await esLibFactory();
  esLib.GameDataBeginLoad([]); // optional
  console.log(new esLib.Point(1, 2));
})();
</script>
~~~


Use in the node REPL (shown with top-level await which is on by default in node 16, for node <16 use `node --experimental-repl-await`):

~~~
> const {default: esLibFactory} = await import('endless-web-bindings');
> const esLib = await esLibFactory();
> p = new esLib.Point(1, 2));
Point {}
> p.X();
1
~~~

[Use in an Observable Notebook](https://observablehq.com/@ballingt/endless-sky-cpp-bindings)
 
## Wrapped classes

See [lib.cpp](./lib.cpp) for which classes are wrapped. It's not hard to add more, but there are some limitations:
* only one constructor overload can be directly exposed
* int64 conversions require manual wrapping to convert to int
* I haven't figured out templates

## How this works

This repository has a specific commit of Endless Sky as a submodule. A patch (patch.diff) is applied to it, mostly to make it compile with the Emscripten toolchain. This patch is based on the changes made to Endless Sky in the [Endless Web](https://github.com/thomasballinger/endless-web) fork.

These modified Endless Sky C++ files are compiled with Emscripten with bindings provided by the Emscripten [embind](https://emscripten.org/docs/porting/connecting_cpp_and_javascript/embind.html) macros in lib.cpp.

These distributed files include core Endless Sky game data but not images or sounds.

## Potential Uses of this library
These aren't possible yet, but might influence design.

* npm-installable command line data parser which exactly mirrors game loading logic
* live preview of derived properties when making data file changes
* GUI ship editor that produces data files for plugin authors
* text editor tool providing autocompletion and syntax highlighting when writing data files
* "fly this ship around" widget that embeds the full game on a webpage with tweakable stats/outfits
* player assistance tools displaying game information live as it is played
* online mission editor tool
* deep linking to game situations more specific than a savefile
* hooks into game logic for customization of https://play-endless-web.com from JavaScript
