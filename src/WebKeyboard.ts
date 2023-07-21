import { IKeyboard } from "./chip8/interfaces/IKeyboard";
import { IKeyboardKeyListener } from "./chip8/interfaces/IKeyboardKeyListener";

export class WebKeyboard implements IKeyboard {
    keyPressed: number;
    keys: Array<number>;
    keyPressedListener: Array<IKeyboardKeyListener>;
    keyMap: { [k: string]: number };

    constructor() {
        this.keyPressedListener = new Array<IKeyboardKeyListener>();
        this.keys = new Array<number>(16).fill(0); // 0 to F
        this.keyPressed = -1;
        this.keyMap = {
            'X': 0,
            '1': 1,
            '2': 2,
            '3': 3,
            'Q': 4,
            'W': 5,
            'E': 6,
            'A': 7,
            'S': 8,
            'D': 9,
            'Z': 0xA,
            'C': 0xB,
            '4': 0xC,
            'R': 0xD,
            'F': 0xE,
            'V': 0xF,
        };
        let self = this;
        window.onkeydown = function(event: KeyboardEvent) {
            let key = event.key.toUpperCase();
            if (!(key in self.keyMap)) return;
            let index = self.keyMap[key];
            if (!self.isKeyPressed(index)) {
                self.update(self.keyMap[key], 1);
                for (let listener of self.keyPressedListener) {
                    listener.onKeyPressed(index);
                }
            }
        }
        window.onkeyup = function(event: KeyboardEvent) {
            let key = event.key.toUpperCase();
            if (!(key in self.keyMap)) return;
            self.update(self.keyMap[key], 0);
        }
    }
    
    isKeyPressed(key: number): boolean {
        return this.keys[key] != 0;
    }

    update(key: number, value: number): void {
        this.keys[key] = value;
    }

    addKeyPressedListener(entity: IKeyboardKeyListener): void {
        if (!this.keyPressedListener.includes(entity)) {
            this.keyPressedListener.push(entity);
        }
    }

    removeKeyPressedListener(entity: IKeyboardKeyListener): void {
        const index = this.keyPressedListener.indexOf(entity); 
        if (index != -1) {
            this.keyPressedListener.splice(index, 1);
        }
    }
}