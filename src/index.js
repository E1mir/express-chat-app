if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({path: './config/.env.development'})
}

const path = require('path')
const http = require('http')
const express = require('express')
const {Server} = require('socket.io')
const Filter = require('bad-words')
const {
  generateMessage,
  generateLocationMessage
} = require('./utils/messages')
const {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
} = require('./utils/users')
const {
  addRoom,
  getRooms,
  removeRoom,
  hasRoom
} = require('./utils/rooms')

const app = express()
const httpServer = http.createServer(app)
const io = new Server(httpServer)

const port = process.env.PORT
const publicDirPath = path.join(__dirname, '../public')

// Setting up static directory
app.use(express.static(publicDirPath))

app.get('', (req, res) => {
  res.render('index')
})


io.on('connection', (socket) => {

  io.emit('roomsList', {
    rooms: getRooms()
  })

  socket.on('join', ({username, room, isCreateRoom}, callback) => {
    const {error, user} = addUser({id: socket.id, username, room})

    if (error) {
      return callback({
        status: 'Declined',
        message: error
      })
    }
    if (isCreateRoom?.toLowerCase() === 'true' && hasRoom(user.room)) {
      return callback({
        status: 'Declined',
        message: 'Room name already taken!'
      })
    }

    socket.join(user.room)
    addRoom(user.room)

    socket.emit('message', generateMessage('Server', `Welcome ${user.username}!`))
    socket.broadcast.to(user.room).emit('message', generateMessage(`Server`, `${user.username} has joined!`))
    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    })

    io.emit('roomsList', {
      rooms: getRooms()
    })

    callback({
      status: 'Ok'
    })
  })

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id)

    if (!user) {
      return callback({
        status: 'Declined',
        message: 'User not found!'
      })
    }

    const filter = new Filter()

    if (filter.isProfane(message)) {
      return callback({
        message: 'Profanity is not allowed!',
        status: 'Declined'
      })
    }

    io.to(user.room).emit('message', generateMessage(user.username, message))
    callback({
      status: 'Ok'
    });
  })

  socket.on('sendLocation', (coords, callback) => {
    const user = getUser(socket.id)

    if (!user) {
      return callback({
        status: 'Declined',
        message: 'User not found!'
      })
    }

    const {latitude, longitude} = coords
    const gmapsLink = `https://www.google.com/maps/?q=${latitude},${longitude}`

    io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, gmapsLink))
    callback({
      status: 'Ok'
    })
  })

  socket.on('disconnect', async () => {
    const user = removeUser(socket.id)
    if (user) {
      const sockets = await io.in(user.room).fetchSockets()
      io.to(user.room).emit('message', generateMessage('Server', `${user.username} has left!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      })

      if (sockets.length === 0) {
        removeRoom(user.room)
        io.emit('roomsList', {
          rooms: getRooms()
        })
      }
    }
  })
})

httpServer.listen(port, () => {
  console.log(`Server is up on port ${port}.`)
})
