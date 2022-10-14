const path = require("path");
const http = require("http");
const express = require("express");
const socketIO = require("socket.io");
const Fillter = require("bad-words");
const { generateMessage, generateMessageLocation } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users')

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



  socket.on('join', ({ username, room}, callback)=>{
    const {error, user} = addUser({ id: socket.id, username, room})

    if(error) {
     return callback(error)
    }

    socket.join(user.room)
    
    socket.emit("message", generateMessage(welcomeMessage+" "+user.username))
    socket.broadcast.to(user.room).emit("message", generateMessage(`${user.username} has joined!`));

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })
    
    callback()
  })

  socket.on("sendMessage", (messageClient, callback) => {
    const user = getUser(socket.id)

    // if(user.error){
    //   return callback(user.error)
    // }

    const fillter = new Fillter();

    if (fillter.isProfane(messageClient)) {
      return callback("Profanity is not allowed!");
    }

    io.to(user.room).emit("message", generateMessage(user.username, messageClient));
    callback();
  });
  socket.on("sendLocation", (coords, callback) => {
    const user = getUser(socket.id)

    io.to(user.room).emit("locationMessage",  generateMessageLocation(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));

    callback();

  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id)

    if (user) {
      io.to(user.room).emit("message", generateMessage(`${user.username} has left!`));
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })
    }

  });


});

//MY ADRES IP and npm run dev --host 192.168.1.37
server.listen(port,() => {
  console.log("Working on port " + port);
});
