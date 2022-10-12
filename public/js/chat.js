const socket = io();

// elements 
const $messageForm = document.querySelector("#message-form")
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $locationButton = document.querySelector("#send-location")
const $messages = document.querySelector('#messages')

// templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML



socket.on("message", (messageClient) => {
  console.log(messageClient);
  const html = Mustache.render(messageTemplate, {
    messageClient: messageClient.text,
    createdAt: moment(messageClient.createdAt).format('HH:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html) 

});

socket.on("locationMessage", (locationData) => {
  const html = Mustache.render(locationMessageTemplate, {
    url: locationData.url,
    createdAt: moment(locationData.createdAt).format('HH:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html) 
  // console.log(locationData)
  
})

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();

  $messageFormButton.setAttribute('disabled', 'disabled')

  const message = e.target.elements.message.value;

  socket.emit("sendMessage", message, (error) => {


  $messageFormButton.removeAttribute('disabled')
  $messageFormInput.value = ''
  $messageFormInput.focus()

    if (error) {
      return console.log(error);
    }
    console.log("The message was delivered!");
  });
});

$locationButton.addEventListener("click", () => {

  if (!navigator.geolocation) {
    return alert("Geolocation is not supported by yoru browser");
  }

  $locationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {

    socket.emit("sendLocation", {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, () => {
      $locationButton.removeAttribute('disabled')
      console.log("Location shared!");
    });
  });
});
