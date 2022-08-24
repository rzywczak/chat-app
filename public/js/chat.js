const socket = io();

socket.on("message", (messageClient) => {
  console.log(messageClient);
});

document.querySelector("#message-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {
    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered!");
  });
});

document.querySelector("#send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by yoru browser");
  }
  navigator.geolocation.getCurrentPosition((position) => {
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude;
    const location = `https://google.com/maps?q=${latitude},${longitude}`;
    socket.emit("sendLocation", location, () => {
      console.log("Location shared!");
    });
  });
});
