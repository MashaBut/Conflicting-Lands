import "./work-with-html/path-to-dices";
import "./work-with-html/path-to-css";
import { PathToMedia } from "./work-with-html/path-to-media";
import { View } from "./work-with-html/view";
import { Allerts } from "./work-with-html/work-with-allerts";
import { ManipulationWithDOM as DOM } from "./work-with-html/manipulations-with-dom";
import { PushImage } from "./work-with-html/push-image";
import { ColorPlayers } from "./game/enums/color-players";
import { ColorMap } from "./game/enums/color-map";
import { SizeMap } from "./game/enums/size-map";

import { fromEvent } from 'rxjs';

import { DiceRoller } from "./game/dice-roller";
import { Block } from "../../../library/dist";

import { Game } from "./controller-main-module";

import { MessageCreator } from "../../../library/dist/message-creator";
import { MessageType } from "../../../library/dist/index";
import { KeyCodes } from "./key-codes";
import { Settings } from "../../../library/dist/index";
const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:');
let socketUrl = socketProtocol + '//' + location.host;
const socket = new WebSocket(socketUrl);

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    createButtonForMobileVersion();
    if (screen.orientation.type === "portrait-primary") {
        alert("Переверните экран");
    }
} else {
    deleteDivMobVersion();
}
window.addEventListener("orientationchange", function () {
    if (screen.orientation.type === "portrait-primary") {
        alert("Переверните экран");
    }
}, false);

let messageCreator = new MessageCreator();
let game: Game = new Game();
let name: string;
let dices: number[];
let arrayRooms: Array<any>;
let settings: Settings = new Settings();
setUpSettings();

setTimeout(() => {
    let a: any = localStorage.getItem('JwtCooper')
    socket.send(JSON.stringify(messageCreator.createMessageToken(a)));
    View.HollPage();
}, 1500);

let pathToPicture: string = "https://srcb.oboi.ws/wallpapers/big_12502_oboi_ryzhaja_lisa_v_snegu.jpg"
View.StartPage();
socket.onmessage = function (message: any) {
    let msg = JSON.parse(message.data);
    switch (msg.type) {
        case MessageType.SetName:
            name = msg.name;
            let path: string = pathToPicture;
            DOM.TWO.style.backgroundImage = "url('" + path + "')";
            DOM.ONE.style.backgroundImage = "url('" + msg.photoURL + "')";
            game.setPlayer1(name, settings.firstPlayerColor);
            break;
        case MessageType.CreateRoom:
            clearRooms();
            arrayRooms = msg.rooms;
            arrayRooms.forEach((room: any) => {
                viewRoom(room.id, room.name, room.creatorName);
            });
            break;
        case MessageType.ResultsAllPlayers:
            let a: any = msg.results;
            clearTable();
            a.forEach((result: any) => {
                fillTheTable(DOM.tableBody, result); 
               // console.log("Name: " + result.name + " isWinner: " + result.isWinner + " result: " + result.result + " dateOfDate: " + result.dateOfDate);
            });
            break;
        case MessageType.SendInfoToPlayerRooms:
            settings = msg.settings;
            game.initCanvas(settings);
            if (msg.currentPlayer == 0) {
                DOM.ONE.style.backgroundImage = "url('" + msg.picture[0] + "')";
                DOM.TWO.style.backgroundImage = "url('" + msg.picture[1] + "')";
                game.setPlayer1(msg.firstPlayerName, settings.firstPlayerColor);
                game.setPlayer2(msg.secondPlayerName, settings.secondPlayerColor);
            }
            else if (msg.currentPlayer == 1) {
                DOM.ONE.style.backgroundImage = "url('" + msg.picture[1] + "')";
                DOM.TWO.style.backgroundImage = "url('" + msg.picture[0] + "')";
                game.setPlayer2(msg.firstPlayerName, settings.firstPlayerColor);
                game.setPlayer1(msg.secondPlayerName, settings.secondPlayerColor);
            }
            socket.send(JSON.stringify(messageCreator.createMessageGridSending(settings)));
            break;
        case MessageType.SendDice:
            dices = msg.dices;
            tossDice();
            break;
        case MessageType.IsPosition:
            game.elemInNumber = game.currentPosition;
            game.currentPosition = game.convertBlockSizeToPixels(game.currentPosition);
            game.draw();
            break;
        case MessageType.GameActionEvents:
            game.setBlockPositionOnMap(msg.event);
            break;
        case MessageType.Failure:
            setTimeout(() => {
                game.failute();
            }, 1500);
            break;
        case MessageType.ErrorForPosition:
            setTimeout(() => {
                Allerts.viewInfoAboutLoosingLife();
            }, 1500);
            break;
        case MessageType.MoveToHollPage:
            Allerts.viewInfoAboutEndingOfTheGame();
            leftGame();
            break;
    }
};

function leftGame(): void {
    Allerts.hideResultsOfTheGame();
    Allerts.hideInfoAboutLoosingLife();
    View.HollPage();
    setUpSettings();
    game = new Game();
    DOM.undisabledButtonDice();
    let path: string = pathToPicture;
    DOM.ONE.style.cssText = "background-image: url(" + path + ");";
    DOM.TWO.style.cssText = "background-image: url(" + path + ");";
}

fromEvent(DOM.createRoom, 'click')
    .subscribe(() => {
        const nameRoom = (DOM.nameRoom).value;
        if (nameRoom != "") {
            if (settings.firstPlayerColor != settings.secondPlayerColor) {
                socket.send(JSON.stringify(messageCreator.createMessageSetName("a", "b")));
                socket.send(JSON.stringify(messageCreator.createMessageSetNameRoom(nameRoom, settings)));
                game = new Game();
                game.initCanvas(settings);
                View.GamePage();
                game.initCanvas(settings);
                DOM.playSound(PathToMedia.playGame);
                PushImage.createImage();
                DOM.initSounds();
            }
            else {
                Allerts.viewWarning(DOM.warningAboutColor);
            }
        }
        else {
            Allerts.viewWarning(DOM.warningAboutNameOfRoom);
        }
        Allerts.hideInfo();
    });

setTimeout(function () {
    window.onresize = function () {
        setTimeout(function () {
            game.drawNewCanvas(settings.width, settings.height, settings.mapColor, settings.gridColor);
            game.draw();
            //game.calculatePosition();
        }, 20);
    }
}, 200);


DOM.infoButton.addEventListener('click', function (event: any) { Allerts.viewInfo(DOM.gridForHollPage); });

DOM.informationForGame.addEventListener('click', function (event: any) { Allerts.viewInfo(DOM.gridForGamePage); });

DOM.hideInformationAboutGame.addEventListener('click', function (event: any) { Allerts.hideInfo(); });

DOM.hideWarningAboutColor.addEventListener('click', function (event: any) { Allerts.hideWarning(DOM.warningAboutColor); });

DOM.hideWarningAboutNameOfRoom.addEventListener('click', function (event: any) { Allerts.hideWarning(DOM.warningAboutNameOfRoom); });

DOM.hideWarningAboutLoosingLife.addEventListener('click', function (event: any) { Allerts.hideInfoAboutLoosingLife(); });

DOM.hideWarningAboutуEndingOfTheGame.addEventListener('click', function (event: any) { Allerts.hideInfoAboutEndingOfTheGame(); });

DOM.viewStatistics.addEventListener('click', function (event: any) { View.StatisticsPage(); })

DOM.hideStatisticsButton.addEventListener('click', function (event: any) {View.HollPage(); })


function fillTheTable(tbody:HTMLElement, obj:any) :void {
    let tb = tbody;
    let tr = document.createElement('tr');
    tb.appendChild(tr);
    let th1 = document.createElement('th');
    let th2 = document.createElement('th');
    let th3 = document.createElement('th');
    let th4 = document.createElement('th');
    th1.textContent = obj.name;
    th2.textContent = obj.isWinnew;
    th3.textContent = obj.result;
    th4.textContent = obj.dateOfDate;
    tr.appendChild(th1);
    tr.appendChild(th2);
    tr.appendChild(th3);
    tr.appendChild(th4);
}

function clearTable(): void {
    let idDiv: any = DOM.tableBody;
    while (idDiv.hasChildNodes()) {
        idDiv.removeChild(idDiv.lastChild);
    }
}

function createButtonForMobileVersion(): void {
    buttonForMobileVersion("moveToLeft", "←", DOM.flexBox1);
    buttonForMobileVersion("moveToRight", "→", DOM.flexBox2);
    buttonForMobileVersion("setUp", "Set Up", DOM.flexBox2);
    buttonForMobileVersion("rotate", "Rotate", DOM.flexBox1);
}

function buttonForMobileVersion(id: string, text: string, div: HTMLElement): void {
    let flexBox = div;
    let newButton = document.createElement('button');
    newButton.id = id;
    newButton.textContent = text;
    flexBox.appendChild(newButton);
}

function deleteDivMobVersion(): void {
    let idDiv: any = DOM.divMobVersion;
    while (idDiv.hasChildNodes()) {
        idDiv.removeChild(idDiv.lastChild);
    }
}

DOM.divMobVersion.addEventListener('click', (event: any) => {
    let idBtn = event.srcElement.id;
    switch (idBtn) {
        case "moveToLeft":
            socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("moveToLeft")));
            break;
        case "moveToRight":
            socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("moveToRight")));
            break;
        case "setUp":
            socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("setUpBlock")));
            break;
        case "rotate":
            socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("rotateBlock")));
            break;
    }
})

function viewRoom(id: string, name: string, nameOfPlayer: string): void {
    let roomsDiv = DOM.rooms;
    let newButton = document.createElement('button');
    newButton.id = "clientRoom";
    newButton.value = id;
    newButton.textContent = name;
    newButton.dataset.title = nameOfPlayer;
    roomsDiv.appendChild(newButton);
}

function clearRooms(): void {
    let idDiv: any = DOM.rooms;
    while (idDiv.hasChildNodes()) {
        idDiv.removeChild(idDiv.lastChild);
    }
}

function setUpSettings(): void {
    settings.firstPlayerColor = ColorPlayers.Red;
    DOM.redButton1.textContent = "✔";
    DOM.blueButton1.textContent = " ";
    DOM.orangeButton1.textContent = " ";
    settings.secondPlayerColor = ColorPlayers.Blue;
    DOM.blueButton2.textContent = "✔";
    DOM.orangeButton2.textContent = " ";
    DOM.redButton2.textContent = " ";
    settings.mapColor = ColorMap.BlueMap;
    DOM.blueMap.textContent = "✔";
    DOM.brownMap.textContent = " ";
    DOM.whiteMap.textContent = " ";
    settings.gridColor = ColorMap.BlueGrid;
    settings.width = SizeMap.BigX;
    settings.height = SizeMap.BigY;
    DOM.bigMap.textContent = "✔";
    DOM.smallMap.textContent = "Small";
    DOM.mediumMap.textContent = "Medium";
}

DOM.rooms.addEventListener('click', function (event: any) {
    let idJoinRoom = event.srcElement.value;
    for (let room of arrayRooms) {
        if (room.id === idJoinRoom) {
            socket.send(JSON.stringify(messageCreator.createMessageJoinTheRoom(idJoinRoom)));
            View.GamePage();
            DOM.playSound(PathToMedia.playGame);
            PushImage.createImage();
            DOM.initSounds();
            break;
        }
    }
});

DOM.settings.addEventListener('click', (event: any) => {
    const setting = event.srcElement.id;
    switch (setting) {
        case "orangeButton1":
            settings.firstPlayerColor = ColorPlayers.Orange;
            DOM.orangeButton1.textContent = "✔";
            DOM.redButton1.textContent = " ";
            DOM.blueButton1.textContent = " ";
            break;
        case "redButton1":
            settings.firstPlayerColor = ColorPlayers.Red;
            DOM.redButton1.textContent = "✔";
            DOM.blueButton1.textContent = " ";
            DOM.orangeButton1.textContent = " ";
            break;
        case "blueButton1":
            settings.firstPlayerColor = ColorPlayers.Blue;
            DOM.blueButton1.textContent = "✔";
            DOM.orangeButton1.textContent = " ";
            DOM.redButton1.textContent = " ";
            break;
        case "orangeButton2":
            settings.secondPlayerColor = ColorPlayers.Orange;
            DOM.orangeButton2.textContent = "✔";
            DOM.redButton2.textContent = " ";
            DOM.blueButton2.textContent = " ";
            break;
        case "redButton2":
            settings.secondPlayerColor = ColorPlayers.Red;
            DOM.redButton2.textContent = "✔";
            DOM.blueButton2.textContent = " ";
            DOM.orangeButton2.textContent = " ";
            break;
        case "blueButton2":
            settings.secondPlayerColor = ColorPlayers.Blue;
            DOM.blueButton2.textContent = "✔";
            DOM.orangeButton2.textContent = " ";
            DOM.redButton2.textContent = " ";
            break;
        case "blueMap":
            settings.mapColor = ColorMap.BlueMap;
            settings.gridColor = ColorMap.BlueGrid;
            DOM.blueMap.textContent = "✔";
            DOM.brownMap.textContent = " ";
            DOM.whiteMap.textContent = " ";
            break;
        case "brownMap":
            settings.mapColor = ColorMap.BrownMap;
            settings.gridColor = ColorMap.BrownGrid;
            DOM.brownMap.textContent = "✔";
            DOM.whiteMap.textContent = " ";
            DOM.blueMap.textContent = " ";
            break;
        case "whiteMap":
            settings.mapColor = ColorMap.WhiteMap;
            settings.gridColor = ColorMap.WhiteGrid;
            DOM.whiteMap.textContent = "✔";
            DOM.blueMap.textContent = " ";
            DOM.brownMap.textContent = " ";
            break;
        case "smallMap":
            settings.width = SizeMap.SmallX;
            settings.height = SizeMap.SmallY;
            DOM.smallMap.textContent = "✔";
            DOM.mediumMap.textContent = "Medium";
            DOM.bigMap.textContent = "Big";
            break;
        case "mediumMap":
            settings.width = SizeMap.MediumX;
            settings.height = SizeMap.MediumY;
            DOM.mediumMap.textContent = "✔";
            DOM.smallMap.textContent = "Small";
            DOM.bigMap.textContent = "Big";
            break;
        case "bigMap":
            settings.width = SizeMap.BigX;
            settings.height = SizeMap.BigY;
            DOM.bigMap.textContent = "✔";
            DOM.smallMap.textContent = "Small";
            DOM.mediumMap.textContent = "Medium";
            break;
    }
})

fromEvent(document.body, 'keydown')
    .subscribe((e: KeyboardEvent) => {
        DOM.disableStandardKeyOperation(e);
        switch (e.keyCode) {
            case KeyCodes.Space:
            case KeyCodes.Up:
            case KeyCodes.Down:
                socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("rotateBlock")));
                break;
            case KeyCodes.Right:
                socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("moveToRight")));
                break;
            case KeyCodes.Left:
                socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("moveToLeft")));
                break;
            case KeyCodes.Enter:
                socket.send(JSON.stringify(messageCreator.createMessageGameActionEvents("setUpBlock")));
                break;
        }
    })

fromEvent(DOM.tossDice, 'click')
    .subscribe(() => {
        socket.send(JSON.stringify(messageCreator.createMessageEventTossDice(game.currentPlayer.getColor())));
    });

fromEvent(DOM.soundOff, 'click')
    .subscribe(() => {
        DOM.soundsOff();
    });

fromEvent(DOM.endGame, 'click')
    .subscribe(() => {
        leftGame();
        DOM.playSound(PathToMedia.endOfTheGame);
        socket.send(JSON.stringify(messageCreator.createMessageMoveToHollPage()));
    })

function tossDice(): void {
    PushImage.returmAnimate();
    DOM.playSound(PathToMedia.soundForDice);
    DOM.disabledButtonDice();
    DiceRoller.getPathOfImage(dices);
    setTimeout(timer, 1790);//1890
}

function timer() {
    PushImage.returnImage(dices);
    game.createPositionsBlockForMap(dices);
}

export class SendMmessage {

    public static sendBlock(block: Block): void {
        console.log("Save block" + " x: " + block.x + " y: " + block.y + " h: " + block.height + " w: " + block.width + " color: " + block.color);
        socket.send(JSON.stringify(messageCreator.createMessageSaveBlock(block)));
        game.currentPosition = new Block(0, 0, 0, 0, ColorMap.BlueGrid);
    }

    public static rotateBlock(dices: number[], color: string): void {
        socket.send(JSON.stringify(messageCreator.createMessageBlockReversalEvent(dices, color)));
    }

    public static positionCheck(block: Block): void {
        if (game.arrayCurrentPosition.length != 0) {
            console.log("checkBlock" + " x: " + block.x + " y: " + block.y + " w: " + block.width + " h: " + block.height + " color: " + block.color);
            socket.send(JSON.stringify(messageCreator.createMessagePositionCheck(block)));
        }
    }

    public static resultOfGame(area1: number, area2: number): void {
        socket.send(JSON.stringify(messageCreator.createMessageResultOfGame(area1, area2)));
    }
}