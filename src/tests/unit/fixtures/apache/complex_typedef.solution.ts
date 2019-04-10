export enum MyEnum {
    ONE = 0,
    TWO = 1
}
export type MyInt = number;
export import AnotherName = MyEnum;
export const INT_32: number = 32;
export const WHAT: AnotherName = AnotherName.ONE;
