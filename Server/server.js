const express = require('express')
const socketio = require('socket.io')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users')
const path = require('path')



const PORT = process.env.PORT || 1800
const app = express()

app.set('port', PORT);
app.use(express.static(path.join(__dirname, 'Client', 'proyecto2', 'public', 'index.html')))

const server = app.listen(app.get('port'), () => {
    console.log(`Server running on port :) ${PORT}`)
})

const io = socketio(server)

io.on('connection', (socket) => {
    console.log("se conecto alguien " , socket.id)

    socket.on('join', (data, callback) => {
        let numberOfUsersInRoom = getUsersInRoom(data.room).length
        console.log(data)
        const { error, newUser} = addUser({
            id: socket.id,
            name: numberOfUsersInRoom===0 ? 'Player 1' : 'Player 2',
            room: data.room
        })

        if(error)
            return callback(error)

        socket.join(newUser.room)

        // io.to(newUser.room).emit('roomData', {room: newUser.room, users: getUsersInRoom(newUser.room)})
        // socket.emit('currentUserData', {name: newUser.name})
        callback()
    })
})





