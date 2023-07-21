import { WebScreen } from "./WebScreen";
import { Chip8 } from "./chip8/implementations/Chip8";
import { WebKeyboard } from "./WebKeyboard";
import { WebAudio } from "./WebAudio";

const ROM_PATH = "https://raw.githubusercontent.com/josearmandosilva/chip8/main/roms/";
const ROM_INFO_PATH = ROM_PATH + "roms.json";

let monitor = document.getElementById("screen") as HTMLCanvasElement;

/*
let registers = document.getElementById("registers");
let stack = document.getElementById("stack");
*/

let screen = new WebScreen(monitor);
let keyboard = new WebKeyboard();
let audio = new WebAudio();
let chip8 = new Chip8(screen, keyboard, audio);

let jsonReq = new XMLHttpRequest();
jsonReq.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      let json = JSON.parse(this.responseText);
      if (json) {
        let romReq = new XMLHttpRequest();
         // json[31] ibm
         // Puzzle 50
        console.log("Open:" + ROM_PATH + json[32].file);
        console.log("Description:" + json[32].description);
        romReq.open("GET", ROM_PATH + json[32].file, true);
        romReq.responseType = "arraybuffer";
        romReq.onload = function (oEvent) {
          var arrayBuffer = romReq.response;
          if (arrayBuffer) {
            let byteArray = new Uint8Array(arrayBuffer);
            chip8.load(byteArray);
          }
        };
        romReq.send(null);
      }
  }
};
jsonReq.open("GET", ROM_INFO_PATH, true);
jsonReq.send();
//chip8.cycle();
//chip8.stop();