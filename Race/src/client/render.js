import { vec2 } from "gl-matrix";
import { carInit, carsDraw, resizeCamView, carMove } from "./car.js"

let canvas = null, minimap = null, context = null, globalWidth = 3000, globalHeight = 3000;
let center = vec2.create();
let time = {
    startTime: 0.0,
    time: 0.0
};
let carsOfPlayers;

let keyboard = {
    forward: false,
    back: false,
    left: false,
    right: false,
    arrowUp: false,
    arrowDown: false,
    space: false
};

export function keyboardProcessing(event, isPress) {
    switch (event.key.toLowerCase()) {
        case "w":
            keyboard.forward = isPress;
            break;
        case "a":
            keyboard.left = isPress;
            break;
        case "s":
            keyboard.back = isPress;
            break;
        case "d":
            keyboard.right = isPress;
            break;
        case "o":
            keyboard.arrowUp = isPress;
            break;
        case "l":
            keyboard.arrowDown = isPress;
            break;
        case " ":
            keyboard.space = isPress;
            break;
    }
}

function resizeWindow() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    center = vec2.fromValues(window.innerWidth / 2.0, window.innerHeight / 2.0);
    resizeCamView(canvas.width, canvas.height);
}

export function initRender(username, socket) {
    minimap = document.getElementById("minimapCanvas");
    minimap.classList.remove('hidden');
    socket.on("carsRegistration", (cars) => {
        carsOfPlayers = cars;
    });
    socket.on("carsMove", (cars, name) => {
        carsOfPlayers[name].pos = cars[name].pos;
        carsOfPlayers[name].angle = cars[name].angle;
        carsOfPlayers[name].speed = cars[name].speed;
        carsOfPlayers[name].isLeft = cars[name].isLeft;
        carsOfPlayers[name].isRight = cars[name].isRight;
        carsOfPlayers[name].isStraight = cars[name].isStraight;
        carsOfPlayers[name].isFront = cars[name].isFront;
        carsOfPlayers[name].isBack = cars[name].isBack;
    });
    socket.on("carsInRace", (cars, name) => {
        carsOfPlayers[name].inRace = cars[name].inRace;
    });
    socket.on("carsChange", (cars, name) => {
        carsOfPlayers[name].image = cars[name].image;
        carsOfPlayers[name].width = cars[name].width;
        carsOfPlayers[name].height = cars[name].height;
    });
    time.startTime = Date.now();
    canvas = document.getElementById("gameCanvas");
    canvas.width = 300;
    canvas.height = 300;
    if (!canvas) {
        console.error("Canvas didn't made");
    }
    if (!minimap) {
        console.error("Minimap canvas didn't made");
    }
    context = canvas.getContext("2d");
    resizeWindow();

    carInit(canvas, minimap, socket, username);
    window.addEventListener("resize", resizeWindow);
    minimap.classList.add('hidden');
}

export function windowLoop(username, socket) {
    context.clearRect(0, 0, canvas.width, canvas.height);

    time.time = (Date.now() - time.startTime) / 1000.0;

    let car = carMove(keyboard, carsOfPlayers, username, canvas, socket);

    socket.emit("carPosUpdate", car, username);
    carsDraw(context, carsOfPlayers, username);

    window.requestAnimationFrame(() => windowLoop(username, socket));
}