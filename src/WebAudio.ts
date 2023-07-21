import { IAudio } from "./chip8/interfaces/IAudio";

export class WebAudio implements IAudio {
    oscilator: OscillatorNode;
    context: AudioContext;
    playing: boolean;

    constructor() {
        this.context = new AudioContext()
        this.oscilator = this.context.createOscillator()
        this.oscilator.type = "square"
        this.oscilator.start();
        this.playing = false;
    }

    beep(): void {
        if (!this.playing) {
            this.oscilator.connect(this.context.destination);
            this.playing = true;
        }
    }
    stop(): void {
        if (this.playing) {
            this.oscilator.disconnect(this.context.destination)
            this.playing = false;
        }
    }
}