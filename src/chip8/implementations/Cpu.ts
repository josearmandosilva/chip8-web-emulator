import { Registers } from "./Registers";
import { IKeyboard } from "../interfaces/IKeyboard";
import { IKeyboardKeyListener } from "../interfaces/IKeyboardKeyListener";
import { IMemory } from "../interfaces/IMemory";
import { IScreen } from "../interfaces/IScreen";
import { IStack } from "../interfaces/IStack";
import { IAudio } from "../interfaces/IAudio";
import { IRegister } from "../interfaces/IRegister";

export class CPU implements IKeyboardKeyListener {
    // Memory
    opcode: number; // Current operation code (35 possibilities)
    memory: IMemory; // Memory stack (array of chars)
    V: IRegister; // 15 8-BIT general purpose registers + 1 carry flag. V0 to V15
    I: number; // Index Register 0x000 to 0xFFF
    pc: number; // Program Counter 0x000 to 0xFFF
    gfx: Uint8Array;
    screen: IScreen;
    audio: IAudio;
    fontset: Uint8Array;
    
    delay_timer: number;
    sound_timer: number;

    stack: IStack; // Stack size of 16

    keyboard: IKeyboard; // Possible keys, 0x0 to 0xF
    pressedKey: number;

    constructor(fontset: Uint8Array, memory: IMemory, stack:  IStack, screen: IScreen, keyboard: IKeyboard, audio: IAudio) {
        this.fontset = fontset;
        this.memory = memory;
        this.audio = audio;
        this.stack = stack;
        this.screen = screen;
        this.screen.init(this);
        this.keyboard = keyboard;
        this.V = new Registers(16);
        this.gfx = new Uint8Array(64 * 32).fill(0);
        this.initialize();
    }

    setFontSet() {
        for (var i = 0; i < this.fontset.length; ++i) {
            this.memory.set(i, this.fontset[i]);
        }
    }

    initialize() {
        this.pc     = 0x200;
        this.opcode = 0;
        this.I      = 0;
        this.screen.clear();
        this.stack.clear();
        this.memory.clear();
        this.setFontSet();
        this.V.clear();
        this.pressedKey = -1;
    }

    load(rom: Uint8Array): void {
        for(let i = 0; i < rom.length; ++i)
            this.memory.set(i + 512, rom[i]);
    }
    
    cycle() {
        // Update Timers 60hz
        this.updateTimers();
        for(let i = 0; i < 10; i++) {
            this.step();
        }
    }

    step() {
        // Fetch Opcode
        this.opcode = (this.memory.get(this.pc) << 8) | this.memory.get(this.pc + 1);
        //console.log("opcode: " + this.opcode.toString(16));
        // Decode Opcode
        let x = (this.opcode & 0x0F00) >> 8;
        let y = (this.opcode & 0x00F0) >> 4;
        let kk = this.opcode  & 0x00FF;
        let nnn = this.opcode  & 0x0FFF;
        let n = this.opcode  & 0x000F;

        this.pc += 2;

        switch(this.opcode & 0xF000) {
            case 0x0000:
                // Calls machine code routine (RCA 1802 for COSMAC VIP) at address NNN. Not necessary for most ROMs.
                switch(this.opcode) {
                    case 0x00E0:
                        this.screen.clear();
                        break;
                    case 0x00EE:
                        // Return from a subroutine
                        // Get and remove value from stack
                        let address = this.stack.pop();
                        // Set next memory address = address
                        this.pc = address;
                        break;
                }
                break;
            case 0x1000:
                // Jumps to address NNN.
                this.pc = nnn;
                break;
            case 0x2000:
                this.stack.push(this.pc);
                this.pc = nnn;
                break;
            
            case 0x3000:
                // 3XNN	Cond	if(Vx==NN)	Skips the next instruction if VX equals NN. (Usually the next instruction is a jump to skip a code block)
                if(this.V.get(x) === kk) {
                    this.pc += 2;
                } 
                break;
            case 0x4000:
                // 4XNN	Cond	if(Vx!=NN)	Skips the next instruction if VX doesn't equal NN. (Usually the next instruction is a jump to skip a code block)
                if(this.V.get(x) != kk) {
                    this.pc += 2;
                } 
                break;
            case 0x5000:
                if(this.V.get(x) === this.V.get(y)) {
                    this.pc += 2;
                }
                break;
            case 0x6000:
                this.V.set(x, kk);
                break;
            case 0x7000:
                this.V.set(x, this.V.get(x) + kk);
                break;
            case 0x8000:
                switch(this.opcode & 0x000F) {
                    case 0x0000:
                        this.V.set(x, this.V.get(y));
                        break;
                    case 0x0001:
                        this.V.set(x, this.V.get(x) | this.V.get(y));
                        break;
                    case 0x0002:
                        this.V.set(x, this.V.get(x) & this.V.get(y));
                        break;
                    case 0x0003:
                        this.V.set(x, this.V.get(x) ^ this.V.get(y));
                        break;
                    case 0x0004:
                        if(this.V.get(y) > (0xFF - this.V.get(x)))
                            this.V.set(0xF, 1); //carry
                        else
                            this.V.set(0xF, 0);
                        this.V.set(x, this.V.get(x) + this.V.get(y) );         
                        break;
                    case 0x0005:
                        if(this.V.get(x) >= this.V.get(y))
                            this.V.set(0xF, 1); //dont borrow
                        else
                            this.V.set(0xF, 0);
                        this.V.set(x, this.V.get(x) - this.V.get(y));       
                        break;
                    case 0x0006:
                        this.V.set(0xF, this.V.get(y) & 0x1);
                        this.V.set(x, this.V.get(y) >> 1);
                        break;
                    case 0x0007:
                        if(this.V.get(y) >= this.V.get(x))
                            this.V.set(0xF, 1); // dont borrow
                        else
                            this.V.set(0xF, 0);
                        this.V.set(x, this.V.get(y) - this.V.get(x));
                        break;
                    case 0x000E:
                        this.V.set(0xF, (this.V.get(y) >> 7) & 0x01);
                        this.V.set(x, this.V.get(y) << 1);
                        break;
                }
                break;
            case 0x9000:
                if(this.V.get(x) != this.V.get(y)) {
                    this.pc += 2;
                }
                break;
            case 0xA000: // ANNN: Sets I to the address NNN
                this.I = nnn;
                break;
            case 0xB000: // BNNN Flow PC=V0+NNN	Jumps to the address NNN plus V0.
                console.log("SET PC: " + this.V.get(0) + nnn);
                this.pc = this.V.get(0) + nnn;
                break;
            case 0xC000: // CXNN Rand Vx=rand()&NN Sets VX to the result of a bitwise and operation on a random number (Typically: 0 to 255) and NN.
                let rand = this.rand() & kk;
                this.V.set(x, rand);
                break;
            case 0xD000: // DXYN Disp draw(Vx,Vy,N)	Draws a sprite at coordinate (VX, VY) that has a width of 8 pixels and a height of N+1 pixels. Each row of 8 pixels is read as bit-coded starting from memory location I; I value doesn’t change after the execution of this instruction. As described above, VF is set to 1 if any screen pixels are flipped from set to unset when the sprite is drawn, and to 0 if that doesn’t happen
                let height = n;
                let sprite;
                this.V.set(0xF, 0);
                for (let yline = 0; yline < height; yline++)
                {
                    sprite = this.memory.get(this.I + yline);
                    for(let xline = 0; xline < 8; xline++)
                    {
                        if((sprite & (0x80 >> xline)) != 0)
                        {
                            let index = (this.V.get(x) + xline + (this.V.get(y) + yline) * 64);
                            if(this.gfx[index] == 1) {
                                this.V.set(0xF, 1);
                            }
                            this.gfx[index] = this.gfx[index] ^ 1;
                        }
                    }
                }
                this.screen.update();
                break;
            case 0xE000:
                switch(kk)
                {
                    // EX9E: Skips the next instruction 
                    // if the key stored in VX is pressed
                    case 0x009E:
                        if(this.keyboard.isKeyPressed(this.V.get(x)))
                            this.pc += 2;
                        break;
                    case 0x00A1:
                        if(!this.keyboard.isKeyPressed(this.V.get(x)))
                            this.pc += 2;
                        break;
                }
                break;
            case 0xF000:
                switch(kk) {
                    case 0x0007: // FX07	Timer	Vx = get_delay()	Sets VX to the value of the delay timer.
                        this.V.set(x, this.get_delay());
                        break;
                    case 0x000A: // FX0A	KeyOp	Vx = get_key()	A key press is awaited, and then stored in VX. (Blocking Operation. All instruction halted until next key event)
                        // Se nao tiver adicionar listener
                        this.keyboard.addKeyPressedListener(this);
                        if (this.pressedKey != -1) {
                            this.V.set(x, this.pressedKey);
                            this.pressedKey = -1;
                        }
                        this.pc -= 2;
                        break;
                    case 0x0015: // FX15	Timer	delay_timer(Vx)	Sets the delay timer to VX.
                        this.delay_timer = this.V.get(x);
                        break;
                    case 0x0018: // FX18	Sound	sound_timer(Vx)	Sets the sound timer to VX.
                        this.sound_timer = this.V.get(x);
                        break;
                    case 0x001E: // FX1E	MEM	I +=Vx	Adds VX to I. VF is not affected.[c]
                        this.I = this.I + this.V.get(x);
                        break;
                    case 0x0029: // FX29	MEM	I=sprite_addr[Vx]	Sets I to the location of the sprite for the character in VX. Characters 0-F (in hexadecimal) are represented by a 4x5 font.
                        this.I = this.V.get(x) * 5;
                        break;
                    case 0x0033: // FX33	BCD	set_BCD(Vx); Stores the binary-coded decimal representation of VX, with the most significant of three digits at the address in I, the middle digit at I plus 1, and the least significant digit at I plus 2. (In other words, take the decimal representation of VX, place the hundreds digit in memory at location in I, the tens digit at location I+1, and the ones digit at location I+2.)
                                 // *(I+0)=BCD(3);
                                 // *(I+1)=BCD(2);
                                 // *(I+2)=BCD(1);
                        this.memory.set(this.I, Math.floor(this.V.get(x) / 100));
                        this.memory.set(this.I + 1, Math.floor(this.V.get(x) % 100 / 10));
                        this.memory.set(this.I + 2, this.V.get(x) % 10);
                        break;
                    case 0x0055: // FX55	MEM	reg_dump(Vx,&I)	Stores V0 to VX (including VX) in memory starting at address I. The offset from I is increased by 1 for each value written, but I itself is left unmodified.[d]
                        for (let i = 0; i <= x; i++) {
                            this.memory.set(this.I + i, this.V.get(i));
                        }
                        this.I += x + 1;
                        break;
                    case 0x0065: // FX65	MEM	reg_load(Vx,&I)	Fills V0 to VX (including VX) with values from memory starting at address I. The offset from I is increased by 1 for each value written, but I itself is left unmodified.[d]
                        for (let i = 0; i <= x; i++) {
                            this.V.set(i, this.memory.get(this.I + i));
                        }
                        this.I += x + 1;
                        break;
                }            
                break;
            default:
                console.log("Unknown opcode: " + this.opcode.toString(16));
        }
    }

    updateTimers(): void {
        if(this.delay_timer > 0)
            this.delay_timer--;

        if(this.sound_timer > 0) {
            this.audio.beep();
            this.sound_timer--;
        } else if (this.sound_timer == 0){
            this.audio.stop();
        }
    }

    rand(): number {
        // 0 - 255
        return Math.floor(Math.random() * 256);
    }
    get_delay(): number {
        return this.delay_timer || 0;
    }

    clearScreen() {
        this.screen.clear();
    }

    onKeyPressed(key: number) {
        this.pressedKey = key;
        this.keyboard.removeKeyPressedListener(this);
    }
}