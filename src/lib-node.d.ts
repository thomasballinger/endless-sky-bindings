import { ESLib } from "./augmentlib";
import { ESLibRaw, ModuleInitializer } from "./lib";

declare function factory(m?: ModuleInitializer): Promise<ESLibRaw>;
export default factory;
