export interface IStack {
    stack: Array<number>;
    push(item: number): void;
    pop(): number;
    clear(): void;
}