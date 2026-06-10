import { io } from "socket.io-client";

async function main() {
    // find document elements
    const chatForm = document.getElementById("chat-form");
    const messageInput = document.getElementById("message-input");
    const messagesWindow = document.querySelector(".messages-window");
    const messages = document.getElementById("main");
    const buttonSignOut = document.getElementById("sign-out-btn");

    let userName = localStorage.getItem("chatUsername");
    let isSentHello = localStorage.getItem("isSentHello");

    // connect server
    const socket = io();

    // connect event
    socket.on("connect", () => {
        console.log("Person connect with ID:", socket.id);

        if (userName === null) {
            // show window with name input, if nothing input name = anonim
            userName = prompt("What's your name? (max 30 symbols)") || "Anonim";
            localStorage.setItem("chatUsername", userName);
        }

        // send name to server
        socket.emit("registerName", userName);

        if (isSentHello === null) {
            // hello message
            socket.emit("messageToServer", `Hello everyone!`);
            localStorage.setItem("isSentHello", "true");
        }
    });

    // disconnect event
    socket.on("disconnect", () => {
        console.log(socket.id);
    });

    // listen message from server
    socket.on("messageFromServer", function (data) {
        const item = document.createElement('li');

        const username = document.createElement('strong');
        username.textContent = `${data.username}: `;

        const message = document.createElement('span');
        message.textContent = data.message;

        if (data.username === userName) {
            item.classList.add("own-message");   // own messages
        } else {
            item.classList.add("other-message"); // other messages
        }

        item.appendChild(username);
        item.appendChild(message);
        messages.appendChild(item);
        messagesWindow.scrollTop = messagesWindow.scrollHeight;
    });

    // load history event
    socket.on("loadHistory", function (historyArray) {
        // Clean window before load
        messages.innerHTML = "";

        // Read each message from file
        historyArray.forEach(data => {
            const item = document.createElement('li');

            const username = document.createElement('strong');
            username.textContent = `${data.username}: `;

            const message = document.createElement('span');
            message.textContent = data.message;

            if (data.username === userName) {
                item.classList.add("own-message");
            } else {
                item.classList.add("other-message");
            }

            item.appendChild(username);
            item.appendChild(message);
            messages.appendChild(item);
        });

        // scroll to end after history load
        messagesWindow.scrollTop = messagesWindow.scrollHeight;
    });

    // listen for the form submission (when user clicks "Send" or presses Enter)
    chatForm.addEventListener("submit", (event) => {
        // Prevent the browser from refreshing the webpage (which is its default behavior)
        event.preventDefault();
        const text = messageInput.value.trim();

        // Only send if the user actually typed something (ignores completely empty messages)
        if (text) {
            socket.emit("messageToServer", text);
            messageInput.value = "";
        }
    });

    // listen for button click
    buttonSignOut.addEventListener("click", (event) => {
        // ask for new name
        userName = prompt("What's your name? (max 30 symbols)") || "Anonim";
        localStorage.setItem("chatUsername", userName);

        // send name to server
        socket.emit("registerName", userName);
    });
}

// on load event
window.addEventListener("load", () => {
    main();
});