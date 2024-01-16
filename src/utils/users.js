const users = []
const Filter = require('bad-words')

const addUser = ({id, username, room}) => {
  username = username?.trim().toLowerCase()
  if (Array.isArray(room) && room.length > 0) {
    room = room[0]
  }
  room = room?.trim().toLowerCase()
  const filter = new Filter()

  if (!username || !room) {
    return {
      error: 'Username and room are required!'
    }
  }

  if (username === 'server' || filter.isProfane(username)) {
    return {
      error: 'This username not allowed!'
    }
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username
  })

  if (existingUser) {
    return {
      error: 'Username is in use!'
    }
  }

  const user = {id, username, room}
  users.push(user)

  return {user}
}

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id)

  if (index !== -1) {
    return users.splice(index, 1)[0]
  }
}

const getUser = (id) => {
  return users.find(user => user.id === id)
}

const getUsersInRoom = (room) => {
  return users.filter(user => user.room === room)
}


module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
}
