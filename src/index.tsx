import { WebScreen } from "./WebScreen";
import { Chip8 } from "./chip8/implementations/Chip8";
import { WebKeyboard } from "./WebKeyboard";
import { WebAudio } from "./WebAudio";
import * as React from 'react';
import { FunctionComponent, useState, useEffect, FC } from 'react';
import * as ReactDOM from 'react-dom/client';
import RomsSelectField from "./components/RomsSelectField";
import Rom from "./interfaces/Rom";

import './index.css';

const ROM_PATH = "https://raw.githubusercontent.com/josearmandosilva/chip8-web-emulator/main/roms/";
const ROM_INFO_PATH = ROM_PATH + "roms.json";

/*
let monitor = document.getElementById("screen") as HTMLCanvasElement;

let registers = document.getElementById("registers");
let stack = document.getElementById("stack");


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

        //romReq.open("GET", ROM_PATH + json[32].file, true);
        romReq.open("GET", ROM_PATH + json[48].file, true);
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
*/

const App: FunctionComponent = (): JSX.Element => {

  const [romsList, setRomsList] = useState<Rom[]>([]);
  const [chip8, setChip8] = useState<Chip8>(null);

  const canvaRef = React.useRef(null);
  //TODO mostrar os registers e stack ao vivo
  
  // TODO useEffect (?) to fetch the initial data (use axios)
  // Criar um botão de reset

  useEffect(() => {
      const element = canvaRef.current;

      let screen = new WebScreen(element);
      let keyboard = new WebKeyboard();
      let audio = new WebAudio();
      setChip8(new Chip8(screen, keyboard, audio));

      const fetchRomsList = async () => {
        try {
          const response = await fetch(ROM_INFO_PATH);
          const data = await response.json();
          data.shift();
          setRomsList(data);    
        } catch(ex) {
          console.log(ex);
        }
      };
      fetchRomsList();
  }, []);

  const onRomSelect = (rom : Rom) => {
    chip8.stop();
    chip8.reset();
    const fetchRomData = async () => {
      try {
        const response = await fetch(ROM_PATH + rom.file);
        const arrayBuffer = await response.arrayBuffer();
        let byteArray = new Uint8Array(arrayBuffer);
        chip8.load(byteArray);
        chip8.start();
      } catch(ex) {
        chip8.stop();
      }
    };
    fetchRomData();
  }

  const buttonHandler = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const button: HTMLButtonElement = event.currentTarget;
    alert(button.name);
  };

  return (
    <main className="flex flex-col text-center items-center bg-gray-800 h-screen">
        <div className="text-4xl font-bold my-10 text-white tracking-widest">CHIP 8 EMULATOR</div>
        <div className="flex flex-row">
            <canvas ref={canvaRef} width="640" height="320" id="screen" className="border-2 rounded-md"></canvas>
            <div className="pl-2">
              <RomsSelectField onChange={rom => onRomSelect(rom)} roms={romsList} disabled={false} />
              <div className="mt-5">
                {"|1|2|3|C| -> |1|2|3|4|".split("").map(char => <span className="w-[11px] inline-block">{char}</span>)}<br />
                {"|4|5|6|D| -> |Q|W|E|R|".split("").map(char => <span className="w-[11px] inline-block">{char}</span>)}<br />
                {"|7|8|9|E| -> |A|S|D|F|".split("").map(char => <span className="w-[11px] inline-block">{char}</span>)}<br />
                {"|A|0|B|F| -> |Z|X|C|V|".split("").map(char => <span className="w-[11px] inline-block">{char}</span>)}<br />
              </div>
            </div>
        </div>
        <div>Developed by José Silva</div>
        <div className="mt-3">
          References: 
          <ul>
            <li><a href="https://en.wikipedia.org/wiki/CHIP-8">https://en.wikipedia.org/wiki/CHIP-8</a></li>
            <li><a href="https://tobiasvl.github.io/blog/write-a-chip-8-emulator/">https://tobiasvl.github.io/blog/write-a-chip-8-emulator/</a></li>
            <li><a href="http://devernay.free.fr/hacks/chip8/C8TECH10.HTM">http://devernay.free.fr/hacks/chip8/C8TECH10.HTM</a></li>
          </ul>
        </div>
    </main>
  );
}


const root = ReactDOM.createRoot(document.getElementById("app") as HTMLElement);
root.render(
  <App />
);