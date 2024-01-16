const rooms = new Set()

const addRoom = (room) => {
  rooms.add(room)
}

const getRooms = () => {
  return [...rooms]
}

const hasRoom = (room) => {
  return rooms.has(room)
}

const removeRoom = (room) => {
  rooms.delete(room)
}

module.exports = {
  addRoom,
  getRooms,
  hasRoom,
  removeRoom
}
