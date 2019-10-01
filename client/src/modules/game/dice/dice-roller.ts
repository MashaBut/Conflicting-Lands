import { Dice, getRandomIntInclusive } from "./dice";

export class DiceRoller {
  private static dices = new Array();

  public static roll(diceCollection: Array<Dice>) {
    let i = 0;
    diceCollection.forEach(() => {
      this.dices[i] = getRandomIntInclusive(1, 6);
      i++;
    });
  }

  public static numberOfDices(): number[] {
    return [this.dices[0], this.dices[1]];
  }

  public static getPathOfImage(dices:number[]) {
    let path = dices[0] + "_" + dices[1] + ".png";
    return path;
  }
}
