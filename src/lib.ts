export type Vector<T> = {
  get(i: number): T;
  size(): number;
  toArr(): T[];
};
export type Dictionary = {
  Get(k: string): number;
  Set(k: string, v: number): void;
  keys(): Vector<string>;
  values(): Vector<number>;
  toObj(): Record<string, number>;
};
export type EsSet<T> = {
  Get(k: string): T;
  keys(): Vector<string>;
  values(): Vector<T>;
};

export type Account = {
  Credits(): number;
  AddCredits(n: number): number;
};

export type Angle = {
  Degrees(): number;
};

export type DataNode = {
  Size(): number;
  Value(n: number): number;
  Token(n: number): string;
  IsNumber(n: number): boolean;
  HasChildren(): boolean;
  PrintTrace(): void;
  children(): Vector<DataNode>;
};

export type Point = {
  X(): number;
  Y(): number;
  Set(x: number, y: number): void;
};

export type Outfit = {
  Attributes(): Dictionary;
};

export type Ship = {
  // TODO
  ModelName(): string;
  BaseAttributes(): Outfit;
  ChassisCost(): number;
  Cost(): number;
};

// Now constructors for them all

export type ESLibRaw = {
  Account: { new (): Account };
  Angle: { new (): Angle };
  AsDataNode(s: string): DataNode;
  DataNodeVec: { new (): Vector<DataNode> };
  Point: { new (x: number, y: number): Point };
  Dictionary: { new (): Dictionary };
  Ship: { new (d: DataNode): Ship };
};

// Emscripten Module object https://emscripten.org/docs/api_reference/module.html
export type ModuleInitializer = {
  getPreloadedPackage(
    remotePackageName: string,
    remotePackageSize: string
  ): ArrayBuffer;
};

export type Mod = {
  default(module?: ModuleInitializer): ESLibRaw;
};

