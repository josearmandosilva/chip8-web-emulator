import { CPU } from "./chip8/implementations/Cpu";
import { IScreen } from "./chip8/interfaces/IScreen";

export class WebScreen implements IScreen {

    cpu: CPU;
    ctx: CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.ctx = canvas.getContext("2d");
    }
    init(cpu: CPU): void {
        this.cpu = cpu;
    }

    clear(): void {
        this.cpu.gfx.fill(0);
        this.ctx.fillRect(0, 0, 64, 32);
    }

    update(): void {
        // clear screeb with paint
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, 64 * 10, 32 * 10);
        for(let w = 0; w < 64; w++) {
            for(let h = 0; h < 32; h++) {
                this.ctx.fillStyle = this.cpu.gfx[w + h * 64] ? "#FFFFFF" : "#000000";
                this.ctx.fillRect(w * 10, h * 10, 9, 9);
                this.ctx.stroke();
            }
        }
    }
}

