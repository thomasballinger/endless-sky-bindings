export type Vector<T> = {
  get(i: number): T;
  size(): number;
};
export type Dictionary = {
  Get(k: string): number;
  Set(k: string, v: number): void;
  keys(): Vector<string>;
  values(): Vector<number>;
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

export type ESLibRaw = {
  Account: { new (): Account };
  Angle: { new (): Angle };
  DataNodeVec: { new (): Vector<DataNode> };
};
