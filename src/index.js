const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, "../public");

app.use(express.static(publicDirectoryPath));

// let count = 0;
let welcomeMessage = "Welcome";

io.on("connection", (socket) => {
  console.log("WebSocket connection");

  socket.emit("showMessage", welcomeMessage);
  socket.broadcast.emit("showMessage", "A new user join!");

  socket.on("sendMessage", (messageClient) => {
    io.emit("showMessage", messageClient);
  });
});

server.listen(port, () => {
  console.log("Working on port " + port);
});
