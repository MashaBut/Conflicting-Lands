import {Directions} from './key-designations';
export class ManipulationWithDOM {
    static tossDice: HTMLElement = <HTMLElement> document.getElementById("rollTheDice");
    static dice1: HTMLElement = <HTMLElement> document.getElementById('dice1');
    static dice2: HTMLElement = <HTMLElement> document.getElementById('dice2');
    static writeNames: HTMLElement = <HTMLButtonElement> document.getElementById('writeNames');
    static player1: HTMLInputElement = <HTMLInputElement>document.getElementById("player1");
    static player2: HTMLInputElement = <HTMLInputElement>document.getElementById("player2");
    static canvas:HTMLCanvasElement = <HTMLCanvasElement> document.getElementById('fuildGame');

    public static disabledButtonDice(): void {
        this.tossDice.setAttribute("disabled", "true");
    }

    public static undisabledButtonDice(): void {
        this.tossDice.removeAttribute("disabled");
    }

    public static disableStandardKeyOperation(e: KeyboardEvent): void {
        if([Directions.Enter, Directions.Down, Directions.Left, Directions.Right, Directions.Up].indexOf(e.keyCode) > -1) {
            e.preventDefault();
        }  
    }
}