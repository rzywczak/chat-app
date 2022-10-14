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
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild

  // hight of the new message
  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight+ newMessageMargin;

  // visible height 
  const visibleHeight = $messages.offsetHeight

  // Height of messages container 

  const containerHeight = $messages.scrollHeight 

  // How far i have scrolled?

  const scrollOffset = $messages.scrollTop + visibleHeight

  if(containerHeight - newMessageHeight <= scrollOffset){
    $messages.scrollTop = $messages.scrollHeight
    console.log("testing")
  }


}

socket.on("message", (messageClient) => {
  console.log(messageClient);
  const html = Mustache.render(messageTemplate, {
    username: messageClient.username,
    messageClient: messageClient.text,
    createdAt: moment(messageClient.createdAt).format('HH:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html) 
  autoscroll()
});

socket.on("locationMessage", (locationData) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: locationData.username,
    url: locationData.url,
    createdAt: moment(locationData.createdAt).format('HH:mm')
  })
  $messages.insertAdjacentHTML('beforeend', html) 
  // console.log(locationData)
  autoscroll()
})

socket.on('roomData', ({ room, users })=>
{
 const html = Mustache.render(sidebarTemplate, {
  room: room,
   users: users
 })
 document.querySelector('#sidebar').innerHTML = html

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

socket.emit('join', { username, room}, (error) => {
  if(error){
    alert(error)
    location.href = '/'
  }
})