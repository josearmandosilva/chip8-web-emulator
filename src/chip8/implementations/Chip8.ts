import { CPU } from "./Cpu";
import { Memory } from "./Memory";
import { Stack } from "./Stack";
import { IScreen } from "../interfaces/IScreen";
import { IKeyboard } from "../interfaces/IKeyboard";
import { IStack } from "../interfaces/IStack";
import { IMemory } from "../interfaces/IMemory";
import { IAudio } from "../interfaces/IAudio";

export class Chip8 {

    cpu: CPU;
    //audio: Audio;
    keyboard: IKeyboard;
    screen: Screen;
    fontset: Uint8Array;

    constructor(screen: IScreen, keyboard: IKeyboard, audio: IAudio) {
        this.fontset = new Uint8Array([0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
            0x20, 0x60, 0x20, 0x20, 0x70, // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
            0x90, 0x90, 0xF0, 0x10, 0x10, // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
            0xF0, 0x10, 0x20, 0x40, 0x40, // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90, // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
            0xF0, 0x80, 0x80, 0x80, 0xF0, // C
            0xE0, 0x90, 0x90, 0x90, 0xE0, // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
            0xF0, 0x80, 0xF0, 0x80, 0x80  // F
        ]);
        let memory = new Memory(4096);
        let stack = new Stack(16);
        this.cpu = new CPU(this.fontset, memory, stack, screen, keyboard, audio);
    }

    load(rom: Uint8Array): void {
        this.cpu.load(rom);
        this.cycle();
    }

    cycle(): void {
        let self = this;
        this.cpu.cycle();
        setTimeout(() => { 
            self.cycle();
        }, 1000 / 60);
    }

    reset(): void {
        this.cpu.initialize();
    }
}