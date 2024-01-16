const socket = io();

// Elements
const $messageForm = document.querySelector('#messageForm')
const $messageFormInput = $messageForm.querySelector('input[name="message"]')
const $messageFormSubmitButton = $messageForm.querySelector('button[name="submit"]')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

const {username, room, isCreateRoom} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll = () => {
  const $newMessage = $messages.lastElementChild

  const newMessageStyles = getComputedStyle($newMessage)
  const newMessageMargin = parseInt(newMessageStyles.marginBottom)
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

  const visibleHeight = $messages.offsetHeight

  // Full height of messages container
  const containerHeight = $messages.scrollHeight

  const scrollOffset = $messages.scrollTop + visibleHeight

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight
  }
}

socket.on('message', (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm a')
  })

  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (message) => {
  const html = Mustache.render(locationMessageTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('roomData', ({room, users})=> {
  $sidebar.innerHTML = Mustache.render(sidebarTemplate, {
    room,
    users
  })
})

$messageForm.addEventListener('submit', (e) => {
  e.preventDefault()
  $messageFormSubmitButton.setAttribute('disabled', 'disabled')
  const form = e.target
  const value = $messageFormInput.value

  if (value.trim() !== '') {
    socket.emit('sendMessage', value, (response) => {
      $messageFormSubmitButton.removeAttribute('disabled')
      $messageFormInput.value = ''
      $messageFormInput.focus()
      if (response.status !== 'Ok') {
        alert(response.message)
        return console.error(response.messaage)
      }
    })
  }
})


$sendLocationButton.addEventListener('click', (e) => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser.')
  }

  $sendLocationButton.setAttribute('disabled', 'disabled')

  navigator.geolocation.getCurrentPosition((position) => {

    const {coords: {latitude, longitude}} = position
    socket.emit('sendLocation', {latitude, longitude}, (response) => {
      $sendLocationButton.removeAttribute('disabled')
      if (response.status !== 'Ok') {
        console.error(response.message)
      }
    })
  })
})


socket.emit('join', {username, room, isCreateRoom}, (response) => {
  if (response.status !== 'Ok') {
    alert(response.message)
    location.href = '/'
  }
})
