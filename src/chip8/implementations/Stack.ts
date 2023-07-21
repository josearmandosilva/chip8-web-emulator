import { IStack } from "../interfaces/IStack";

export class Stack implements IStack {
    
    stack: Array<number>;
    size: number;
    sp: number;
    constructor(size: number) {
        this.stack = new Array(16);
        this.clear();
    }

    push(item: number): void {
        this.stack.push(item);
    }
    pop(): number {
        return this.stack.pop();
    }

    clear(): void {
        this.sp = -1;
        this.stack.fill(0);
    }
}