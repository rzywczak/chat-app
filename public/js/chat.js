const socket = io();

// socket.on('countUpdated', (count) => {
//     console.log('The count has been updated', count)
// })

socket.on("showMessage", (messageClient) => {
  console.log(messageClient);
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message);
});
