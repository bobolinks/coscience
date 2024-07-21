/** data type */
declare enum dtype {
  bool = 0,
  int = 4,
  int8 = 1,
  int16 = 2,
  int32 = 4,
  int64 = 8,
  uint = 0x14,
  uint8 = 0x11,
  uint16 = 0x12,
  uint32 = 0x14,
  uint64 = 0x18,
  float = 0x24,
  double = 0x28,
  string = 0x31,
  array = 0x41,
  object = 0x51,
}

declare type Bool = Boolean;
declare type Int<Bits = 32> = number;
declare type Uint<Bits = 32> = number;
declare type Float = number;
declare type Double = number;
declare type Char<Len> = string;
declare type Varchar<Len> = string;
declare type Json = Record<string, any>;

declare type PropDecoration = {
  type: dtype;
  description: string;
}

declare interface PropDecorations {
  [key: string]: PropDecoration;
}

/** base on 1 meter */
declare enum Dimension {
  // 0.2 cm
  SlotSize = 0.0002,
}