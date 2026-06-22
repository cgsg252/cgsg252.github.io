import { vec2 } from 'gl-matrix';
import { drawTrack } from './track.js';
import { initMinimap, drawMinimap } from './minimap.js';
import { loadImage } from './image.js';

/* car object */
let car = {
    pos: new Float32Array(2)[20000, 20000],
    angle: 0.0,
    speed: 0.0,
    width: 0.0,
    height: 0.0,
    image: "renault",
    isLeft: false,
    isRight: false,
    isStraight: true,
    isFront: true,
    isBack: false,
    inRace: false
};

/* camera object */
let camera = {
    pos: vec2.fromValues(0.0, 0.0),
    viewSize: vec2.fromValues(0.0, 0.0)
};

const globalWidth = 30000.0, globalHeight = 30000.0;

let Images = {};

async function carsImagesLoad() {
    Images["renault"] = {
        image: await loadImage("./images/1/f1car_1.png"),
        imageLeft: await loadImage("./images/1/f1car_1_left.png"),
        imageRight: await loadImage("./images/1/f1car_1_right.png")
    };

    Images["black"] = {
        image: await loadImage("./images/2/f1car_2.png"),
        imageLeft: await loadImage("./images/2/f1car_2_left.png"),
        imageRight: await loadImage("./images/2/f1car_2_right.png")
    };

    Images["yellow"] = {
        image: await loadImage("./images/3/f1car_3.png"),
        imageLeft: await loadImage("./images/3/f1car_3_left.png"),
        imageRight: await loadImage("./images/3/f1car_3_right.png")
    };

    Images["white"] = {
        image: await loadImage("./images/4/f1car_4.png"),
        imageLeft: await loadImage("./images/4/f1car_4_left.png"),
        imageRight: await loadImage("./images/4/f1car_4_right.png")
    };
}

export function resizeCamView(width, height) {
    camera.viewSize = vec2.fromValues(width, height);
}

export async function carInit(canvas, minimap, socket, username) {
    car.pos = vec2.fromValues(20000.0, 20000.0);
    car.angle = Math.PI;
    car.speed = 0.0;
    car.width = 150.0;
    car.height = 60.0;
    car.inRace = false;

    camera.pos = vec2.fromValues(car.pos[0] - canvas.width / 2, car.pos[1] - canvas.height / 2);
    initMinimap(globalWidth, globalHeight, minimap);

    socket.emit("carPosUpdate", car, username);
    socket.emit("changeCar", username, "renault");

    await carsImagesLoad();
}

let speedVec = vec2.create();

function cameraCheck() {
    if (camera.pos[0] < -camera.viewSize[0] / 2.0 + car.width) {
        camera.pos[0] = -camera.viewSize[0] / 2.0 + car.width;
    }
    else if (camera.pos[0] > globalWidth - camera.viewSize[0] + camera.viewSize[0] / 2.0 - car.width) {
        camera.pos[0] = globalWidth - camera.viewSize[0] + camera.viewSize[0] / 2.0 - car.width;
    }

    if (camera.pos[1] < -camera.viewSize[1] / 2.0 + car.width) {
        camera.pos[1] = -camera.viewSize[1] / 2.0 + car.width;
    }
    else if (camera.pos[1] > globalHeight - camera.viewSize[1] + camera.viewSize[1] / 2.0 - car.width) {
        camera.pos[1] = globalHeight - camera.viewSize[1] + camera.viewSize[1] / 2.0 - car.width;
    }
}

function carCheck() {
    if (car.pos[0] > globalWidth - car.width)
        car.pos[0] = globalWidth - car.width;
    else if (car.pos[0] < car.width)
        car.pos[0] = car.width;

    if (car.pos[1] > globalHeight - car.width)
        car.pos[1] = globalHeight - car.width;
    else if (car.pos[1] < car.width)
        car.pos[1] = car.width;
}

function carRotate(keyboard) {
    if (keyboard.left) {
        car.angle -= 0.02;
        if (car.angle > Math.PI * 2)
            car.angle = 0;
        if (car.angle < -Math.PI * 2)
            car.angle = 0;
        car.isLeft = true;
        car.isRight = false;
        car.isStraight = false;
    }
    else if (keyboard.right) {
        car.angle += 0.02;
        if (car.angle > Math.PI * 2)
            car.angle = 0;
        if (car.angle < -Math.PI * 2)
            car.angle = 0;
        car.isLeft = false;
        car.isRight = true;
        car.isStraight = false;
    }
    else {
        car.isLeft = false;
        car.isRight = false;
        car.isStraight = true;
    }
}

export function carMove(keyboard, carsOfPlayers, username, canvas, socket) {
    if (carsOfPlayers && carsOfPlayers[username]) {
        car.image = carsOfPlayers[username].image;
        car.height = carsOfPlayers[username].height;
        car.width = carsOfPlayers[username].width;
        if (carsOfPlayers[username].inRace) {
            car.pos = vec2.fromValues(20000.0, 20000.0);
            car.angle = Math.PI;
            car.speed = 0.0;
            camera.pos = vec2.fromValues(car.pos[0] - canvas.width / 2, car.pos[1] - canvas.height / 2);
            socket.emit("carPosUpdate", car, username);
            carsOfPlayers[username].inRace = false;
        }
    }

    /* count speed vector */
    vec2.set(speedVec, Math.cos(car.angle), Math.sin(car.angle));
    vec2.scale(speedVec, speedVec, car.speed);

    /* Move */
    if (keyboard.space) {
        if (car.speed > 0.0) {
            car.speed -= 0.3;
            if (car.speed < 0.0)
                car.speed = 0.0;
        }
        else if (car.speed < 0.0) {
            car.speed += 0.3;
            if (car.speed > 0.0)
                car.speed = 0.0;
        }
        /* car pos */
        vec2.add(car.pos, car.pos, speedVec);
        carCheck();

        /* camera pos */
        vec2.add(camera.pos, camera.pos, speedVec);
        cameraCheck();
    }
    else if (keyboard.forward) {
        if (car.speed <= 28.3)
            car.speed += 0.2;

        /* car pos */
        vec2.add(car.pos, car.pos, speedVec);
        carCheck();

        /* camera pos */
        vec2.add(camera.pos, camera.pos, speedVec);
        cameraCheck();
    }
    else if (keyboard.back) {
        if (car.speed >= -9.3)
            car.speed -= 0.1;

        /* car pos */
        vec2.add(car.pos, car.pos, speedVec);
        carCheck();

        /* camera pos */
        vec2.add(camera.pos, camera.pos, speedVec);
        cameraCheck();
    }
    else {
        if (car.speed >= -0.06 && car.speed <= 0.06)
            car.speed = 0.0;
        if (car.speed > 0.0) {
            car.speed -= 0.1;

            /* car pos */
            vec2.add(car.pos, car.pos, speedVec);
            carCheck();

            /* camera pos */
            vec2.add(camera.pos, camera.pos, speedVec);
            cameraCheck();
        }
        else if (car.speed < 0.0) {
            car.speed += 0.1;

            /* car pos */
            vec2.add(car.pos, car.pos, speedVec);
            carCheck();

            /* camera pos */
            vec2.add(camera.pos, camera.pos, speedVec);
            cameraCheck();
        }
    }

    /* angle */
    if (car.speed >= 0.5 || car.speed <= -0.5)
        carRotate(keyboard);
    else {
        car.isLeft = false;
        car.isRight = false;
        car.isStraight = true;
    }

    if (car.speed >= 0.0) {
        car.isFront = true;
        car.isBack = false;
    }
    else if (car.speed < 0.0) {
        car.isFront = false;
        car.isBack = true;
    }
    return car;
}

export function carsDraw(context, carsOfPlayers, playerName) {
    drawTrack(context, camera, globalWidth, globalHeight, car);
    let playerCar = car;
    if (carsOfPlayers && playerCar) {
        let carPlayer = carsOfPlayers[playerName];
        context.save();
        context.translate(playerCar.pos[0] - camera.pos[0], playerCar.pos[1] - camera.pos[1]);
        context.rotate(playerCar.angle);

        if (Images[carPlayer.image]) {
            if (playerCar.isStraight)
                context.drawImage(Images[carPlayer.image].image, -playerCar.width / 2.0, -playerCar.height / 2.0, playerCar.width, playerCar.height);
            else if (playerCar.isFront) {
                if (playerCar.isLeft)
                    context.drawImage(Images[carPlayer.image].imageLeft, -playerCar.width / 2.0, -playerCar.height / 2.0, playerCar.width, playerCar.height);
                else if (playerCar.isRight)
                    context.drawImage(Images[carPlayer.image].imageRight, -playerCar.width / 2.0, -playerCar.height / 2.0, playerCar.width, playerCar.height);
            }
            else if (playerCar.isBack) {
                if (playerCar.isRight)
                    context.drawImage(Images[carPlayer.image].imageLeft, -playerCar.width / 2.0, -playerCar.height / 2.0, playerCar.width, playerCar.height);
                else if (playerCar.isLeft)
                    context.drawImage(Images[carPlayer.image].imageRight, -playerCar.width / 2.0, -playerCar.height / 2.0, playerCar.width, playerCar.height);
            }
        }
    }
    context.restore();

    for (let name in carsOfPlayers) {
        if (name !== playerName) {
            const otherCar = carsOfPlayers[name];
            if (!otherCar || !otherCar.pos)
                continue;

            const pos = new Float32Array(otherCar.pos);

            context.save();
            context.translate(pos[0] - camera.pos[0], pos[1] - camera.pos[1]);
            context.rotate(otherCar.angle);

            if (Images[otherCar.image]) {
                if (otherCar.isStraight)
                    context.drawImage(Images[otherCar.image].image, -otherCar.width / 2.0, -otherCar.height / 2.0, otherCar.width, otherCar.height);
                else if (otherCar.isFront) {
                    if (otherCar.isLeft)
                        context.drawImage(Images[otherCar.image].imageLeft, -otherCar.width / 2.0, -otherCar.height / 2.0, otherCar.width, otherCar.height);
                    else if (otherCar.isRight)
                        context.drawImage(Images[otherCar.image].imageRight, -otherCar.width / 2.0, -otherCar.height / 2.0, otherCar.width, otherCar.height);
                }
                else if (otherCar.isBack) {
                    if (otherCar.isRight)
                        context.drawImage(Images[otherCar.image].imageLeft, -otherCar.width / 2.0, -otherCar.height / 2.0, otherCar.width, otherCar.height);
                    else if (otherCar.isLeft)
                        context.drawImage(Images[otherCar.image].imageRight, -otherCar.width / 2.0, -otherCar.height / 2.0, otherCar.width, otherCar.height);
                }
            }
            else {
                context.fillStyle = "red";
                context.fillRect(-otherCar.width / 2, -otherCar.height / 2, otherCar.width, otherCar.height);
            }

            context.restore();
        }
    }

    drawMinimap(carsOfPlayers);
}