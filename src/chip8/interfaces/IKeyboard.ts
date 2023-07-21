import { IKeyboardKeyListener } from "./IKeyboardKeyListener";

export interface IKeyboard {
    keyPressed: number;
    keys: Array<number>;
    isKeyPressed(key: number): boolean;
    addKeyPressedListener(entity: IKeyboardKeyListener): void;
    removeKeyPressedListener(entity: IKeyboardKeyListener): void;
}