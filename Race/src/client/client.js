import { io } from "socket.io-client";
import { initRender, windowLoop, keyboardProcessing } from "./render.js";
import { initUI, isPause } from "./UI.js"

/* User class */
class Player {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }
};

let player;
let socket = io();

function init() {
    initUI(socket, player.username);
    initRender(player.username, socket);

    if (player) {
        windowLoop(player.username, socket);
    }
    else
        console.log("no socket");
}

function waitForRegistration(callback) {
    let signIn = document.getElementById("sign_in");
    let messageInput = document.getElementById("name-input");
    let mainMenu = document.getElementById("mainMenu");
    let btnSign = document.getElementById("sign-btn");
    let username = localStorage.getItem("username");

    /* connect event */
    socket.on("connect", () => {
        if (username) {
            socket.emit("registration", username);
            player = new Player(username, "cgsgforever");
            mainMenu.classList.remove('hidden');
            signIn.classList.add('hidden');
            callback();
        }
        else {
            btnSign.addEventListener("click", (event) => {
                // Prevent the browser from refreshing the webpage
                event.preventDefault();
                const text = messageInput.value.trim();
                if (text) {
                    socket.emit("registration", text);
                    localStorage.setItem("username", text);
                    player = new Player(text, "cgsgforever");
                    mainMenu.classList.remove('hidden');
                    signIn.classList.add('hidden');
                    callback();
                }
            });
        }
    });
}

function connectServer() {
    /* disconnect event */
    socket.on("disconnect", () => {
        socket.emit("exit", `${player.username}`)
    });

    waitForRegistration(init);
}

function main() {
    // connect with server
    connectServer();
}

/* on load event */
window.addEventListener("load", () => {
    /* keyboard events */
    window.addEventListener("keydown", (event) => {
        if (!isPause) {
            keyboardProcessing(event, true);
        }
    });
    window.addEventListener("keyup", (event) => {
        keyboardProcessing(event, false);
    });
    main();
});