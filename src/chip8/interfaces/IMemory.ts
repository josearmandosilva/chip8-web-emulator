export interface IMemory {
    array: Uint8Array;
    set(index: number, value: number): void;
    get(index: number): number;
    clear(): void;
}