export enum MyEnum {
    ONE,
    TWO
}
export type MyInt = number;
export import AnotherName = MyEnum;
export const INT_32: MyInt = 32;
export const WHAT: AnotherName = AnotherName.ONE;
