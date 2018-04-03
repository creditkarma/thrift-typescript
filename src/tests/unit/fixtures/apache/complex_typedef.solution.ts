export enum MyEnum {
    ONE,
    TWO
}
export type MyInt = number;
export import AnotherName = MyEnum;
export const INT_32: number = 32;
export const WHAT: AnotherName = AnotherName.ONE;
