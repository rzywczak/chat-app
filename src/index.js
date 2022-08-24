const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const Fillter = require("bad-words");

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

  socket.on("sendMessage", (messageClient, callback) => {
    const fillter = new Fillter();

    if (fillter.isProfane(messageClient)) {
      return callback("Profanity is not allowed!");
    }

    io.emit("message", messageClient);
    callback();
  });
  socket.on("sendLocation", (location, callback) => {
    io.emit("message", location);
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", "A user has left!");
  });
});

server.listen(port, () => {
  console.log("Working on port " + port);
});
