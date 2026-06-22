/* Connected modules */
const http = require("http");
const express = require("express");
const logger = require("morgan");
const { Server } = require("socket.io");
const os = require("os");

/* Setting express */
const app = express();
const port = 3300;
/* Connect middleware */
app.use(logger("dev"));
app.use(express.static("dist"));

/* Create and connect server */
const server = http.createServer(app);
const io = new Server(server);

let cars = {}, usersCount = 0.0;

/* Connection event */
io.on("connection", (socket) => {
    /* Disconnection event */
    socket.on("registration", (name) => {
        socket.username = name;
        cars[name] = {
            pos: new Float32Array([20000.0, 20000.0]),
            angle: Math.PI,
            speed: 0.0,
            width: 150.0,
            height: 60.0,
            image: null,
            isLeft: false,
            isRight: false,
            isStraight: true,
            isFront: true,
            isBack: false,
            inRace: false
        };
        io.emit("carsRegistration", cars);
    });

    socket.on("exit", () => {
        delete cars[socket.username];
    });

    socket.on("carPosUpdate", (car, name) => {
        if (!cars[name]) {
            cars[name] = {
                pos: new Float32Array([20000.0, 20000.0]),
                angle: Math.PI,
                speed: 0.0,
                width: 150.0,
                height: 60.0,
                image: null,
                isLeft: false,
                isRight: false,
                isStraight: true,
                isFront: true,
                isBack: false,
                inRace: false
            }
        }
        cars[name].pos = car.pos;
        cars[name].angle = car.angle;
        cars[name].speed = car.speed;
        cars[name].isLeft = car.isLeft;
        cars[name].isRight = car.isRight;
        cars[name].isFront = car.isFront;
        cars[name].isStraight = car.isStraight;
        cars[name].isBack = car.isBack;

        io.emit("carsMove", cars, name);
    });

    socket.on("startRace", (name) => {
        cars[name].inRace = true;
        io.emit("carsInRace", cars, name);
    });

    socket.on("changeCar", (name, carName) => {
        if (carName === "black") {
            cars[name].image = 'black';
            cars[name].width = 250.0;
            cars[name].height = 154.0;
        }
        if (carName === "renault") {
            cars[name].image = 'renault';
            cars[name].width = 150.0;
            cars[name].height = 60.0;
        }
        if (carName === "yellow") {
            cars[name].image = 'yellow';
            cars[name].width = 250.0;
            cars[name].height = 154.0;
        }
        if (carName === "white") {
            cars[name].image = 'white';
            cars[name].width = 250.0;
            cars[name].height = 154.0;
        }
        io.emit("carsChange", cars, name);
    });
});

/* Output server address */
server.listen(port, () => {
    console.log(`\n=== Race Server Started ===`);
    console.log(`Local access:    http://localhost:${port}`);

    /* Get all network adapters (return object) */
    const nets = os.networkInterfaces();

    /* 1 - get property names
       2 - get inner object
       3 - check if it ipv4 and it's not inner address */
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                console.log(`Network access:  http://${net.address}:${port}`);
            }
        }
    }
    console.log(`===========================\n`);
});