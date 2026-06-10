// Connected modules
const http = require("http");
const express = require("express");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const { Server } = require("socket.io");
const os = require("os");
const fs = require("fs");     // file system module
const path = require("path"); // path system module

// Setting express
const app = express();
const port = 6767;
// Connect middleware
app.use(logger("dev"));
app.use(cookieParser());
app.use(express.static("dist"));

// Create and connect server
const server = http.createServer(app);
const io = new Server(server);

// Path to history.json
const historyFilePath = path.join(__dirname, "history.json");

// Massisve for saving history
let chatHistory = [];

// Load history when server start
try {
    if (fs.existsSync(historyFilePath)) {  // chech if file is exist 
        const fileData = fs.readFileSync(historyFilePath, "utf8"); // read fily body like it is utf8
        chatHistory = JSON.parse(fileData); // parse file body to chatHistory massive
        console.log(`History Loaded, ${chatHistory.length} messages`);
    }
} catch (error) {
    console.error("Could not read history file:", error);
}

// Connection event
io.on("connection", (socket) => {
    // client registration
    console.log(`Client connected with id: ${socket.id}`);

    // load temporary user name
    socket.username = "Loading....";
    socket.isRegisted = false;

    // load history chat to new client
    if (chatHistory.length > 0) {
        socket.emit("loadHistory", chatHistory);
    }

    // load input name
    socket.on("registerName", (name) => {
        socket.username = name.trim().substring(0, 30);
        console.log(`${socket.username} connected`);
        socket.isRegisted = true;
    });

    // wait for client message
    socket.on("messageToServer", (msg) => {
        const cleanMessage = msg.trim();

        // ignore message from not registered people
        if (!socket.isRegisted)
            return;

        // Create message object
        const newMessage = {
            username: socket.username,
            message: cleanMessage,
        };

        // Add to history massive
        chatHistory.push(newMessage);

        // if chat history store more than 100 messages delete the oldest
        if (chatHistory.length > 100) {
            chatHistory.shift(); // delete the oldest message
        }

        // write to json file
        fs.writeFile(historyFilePath, JSON.stringify(chatHistory, null, 2), "utf8", (err) => {
            if (err !== null)
                console.error("Could not save message:", err);
        });

        // send message to everyone (object with username and message)
        io.emit("messageFromServer", {
            username: socket.username,
            message: cleanMessage
        });
    });
    // client disconnect
    socket.on("disconnect", () => {
        console.log(`Client disconnected: ${socket.username}`);
    });
});

// event after server starts listening
server.listen(port, () => {
    console.log(`\n=== Chat Server Started ===`);
    // output local address
    console.log(`Local access:    http://localhost:${port}`);

    // get all network adapters (return object)
    const nets = os.networkInterfaces();

    // 1 - get property names
    // 2 - get inner object
    // 3 - check if it ipv4 and it's not inner address
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === "IPv4" && !net.internal) {
                console.log(`Network access:  http://${net.address}:${port}`);
            }
        }
    }
    console.log(`===========================\n`);
});