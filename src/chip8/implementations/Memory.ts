import { IMemory } from "../interfaces/IMemory";

export class Memory implements IMemory {

    array: Uint8Array;
    size: number;
    
    constructor(size: number) {
        this.size = size;
        this.array = new Uint8Array(size);
        this.clear();
    }
    
    set(index: number, value: number): void {
        if (index < 0 || index > 4095) {
            throw new Error("Memory out of bounds.");
        }
        this.array[index] = value;
    }
    
    get(index: number): number {
        if (index < 0 || index > 4095) {
            throw new Error("Memory out of bounds.");
        }
        return this.array[index];
    }
    
    clear(): void {
        this.array.fill(0);
    }
}