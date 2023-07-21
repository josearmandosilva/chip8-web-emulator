import { IRegister } from "../interfaces/IRegister";

export class Registers implements IRegister {

    array: Uint8Array;
    size: number;

    constructor(size: number) {
        this.size = size;
        this.array = new Uint8Array(size);
        this.clear();
    }
    
    set(index: number, value: number): void {
        if (index < 0 || index > 15) {
            throw new Error("Registers out of bounds.");
        }
        this.array[index] = value;
    }
    
    get(index: number): number {
        if (index < 0 || index > 15) {
            throw new Error("Registers out of bound.");
        }
        return this.array[index];
    }
    
    clear(): void {
        this.array.fill(0);
    }
}