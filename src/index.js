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

  socket.emit("message", welcomeMessage);
  socket.broadcast.emit("message", "A new user has  join!");

  socket.on("sendMessage", (messageClient) => {
    io.emit("message", messageClient);
  });
  socket.on("sendLocation", (location) => {
    io.emit("message", location);
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

server.listen(port, () => {
  console.log("Working on port " + port);
});
