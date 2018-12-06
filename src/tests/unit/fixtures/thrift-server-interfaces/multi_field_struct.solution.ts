export interface IMyStruct {
    id: number;
    bigID: number;
    word: string;
    field1?: number;
    blob?: Buffer;
}
export interface IMyStructArgs {
    id?: number;
    bigID?: number;
    word: string;
    field1?: number;
    blob?: string | Buffer;
}
