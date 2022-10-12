const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const Fillter = require("bad-words");
const { generateMessage, generateMessageLocation } = require('./utils/messages')

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



  socket.on('join', ({ username, room})=>{
    socket.join(room)
    
    socket.emit("message", generateMessage(welcomeMessage))
    socket.broadcast.to(room).emit("message", generateMessage(`${username} has joined!`));

  })

  socket.on("sendMessage", (messageClient, callback) => {
    const fillter = new Fillter();

    if (fillter.isProfane(messageClient)) {
      return callback("Profanity is not allowed!");
    }

    io.emit("message", generateMessage(messageClient));
    callback();
  });
  socket.on("sendLocation", (coords, callback) => {
    io.emit("locationMessage",  generateMessageLocation(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
    callback();
  });

  socket.on("disconnect", () => {
    io.emit("message", generateMessage("A user has left!"));
  });


});

server.listen(port, () => {
  console.log("Working on port " + port);
});
