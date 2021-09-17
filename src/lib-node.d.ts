import { ESLib } from "./augmentlib.js";
import { ESLibRaw, ModuleInitializer } from "./lib.js";

declare function factory(m?: ModuleInitializer): Promise<ESLibRaw>;
export default factory;
