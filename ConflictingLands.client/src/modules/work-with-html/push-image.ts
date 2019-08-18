import { ManipulationWithDOM } from "./manipulations-with-dom";
import { DiceRoller } from "../game/dice/dice-roller";
import { Media } from "./media";

export class PushImage {
    private static image = document.createElement('img');

    public static createImage() {
        this.image.id = "img";
        this.image.src = Media.pathToAnimate;
        ManipulationWithDOM.imageHolder.appendChild(this.image);
    }

    public static returmAnimate() {
        this.image.src = Media.pathToAnimate;
    }

    public static returnImage() {
        let a = DiceRoller.getPathOfImage();
        let pathToImage: string = "./images/png/" + a;
        this.image.src = pathToImage;
    }

}