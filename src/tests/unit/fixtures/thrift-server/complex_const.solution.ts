export enum MyEnum {
    ONE = 0,
    TWO = 1
}
export const WHAT: number = 32;
export const VALUE: number = 32;
export const VALUE_LIST: Array<number> = [32];
export const FALSE_CONST: boolean = false;
export const INT_64: thrift.Int64 = thrift.Int64.fromDecimalString("64");
export const SET_CONST: Set<string> = new Set(["hello", "world", "foo", "bar"]);
export const MAP_CONST: Map<string, string> = new Map<string, string>([["hello", "world"], ["foo", "bar"]]);
export const VALUE_MAP: Map<number, string> = new Map<number, string>([[32, "world"], [5, "bar"]]);
export const LIST_CONST: Array<string> = ["hello", "world", "foo", "bar"];
export const MAP_WITH_ENUM_SET: Map<string, Set<MyEnum>> = new Map<string, Set<MyEnum>>([["hello", new Set([MyEnum.ONE])], ["foo", new Set([MyEnum.TWO])]]);
