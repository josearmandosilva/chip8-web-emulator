import { CPU } from "../implementations/Cpu";

export interface IScreen {
    init(cpu: CPU): void;
    clear(): void;
    update(): void;
}