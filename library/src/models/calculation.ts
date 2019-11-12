import { Block } from "./block";
import { PositionCalculation } from "./position-calculation";

export class Calculation {
    public arrayCurrentPosition = new Array<Block>();
    public color: string = "";
    private numberOfVerticalLines: number = 0;
    private numberOfHorizontalLines: number = 0;
    position = new PositionCalculation();

    public setLines(vertical: number, horizontal: number): void {
        this.numberOfHorizontalLines = horizontal;
        this.numberOfVerticalLines = vertical;
    }
    public сalculatePosition(dices:number[],blocks:Array<Block>): void {
        this.position.initDice(dices);
        this.position.initBlocks(blocks);
        this.arrayCurrentPosition.length = 0;
        this.calculateAllPosition(this.position.currentDices);
        if(this.arrayCurrentPosition.length == 0) {
            this.position.change();
            this.calculateAllPosition(this.position.currentDices);
            if (this.arrayCurrentPosition.length == 0) {
            }
        }
    }

    private calculateAllPosition(size: number[]): void {
        for (let x = 0; x <= this.numberOfHorizontalLines-this.position.currentDices[1]; x++) {
            for (let y = 0; y <= this.numberOfVerticalLines-this.position.currentDices[0]; y++) {
                let block = new Block(y, x, size[0], size[1], this.color);
                if (this.position.checkPosition(block)) {
                    this.arrayCurrentPosition.push(block);
                }
            }
        }
    }
}