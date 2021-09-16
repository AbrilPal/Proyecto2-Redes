const express = require('express')
const socketio = require('socket.io')
const users = []

const addUser = ({id, name, room}) => {
    const numberOfUsersInRoom = users.filter(user => user.room === room).length
    if(numberOfUsersInRoom === 4)
    return { error: 'llena' }

    const newUser = { id, name, room }
    users.push(newUser)
    return { newUser }
}

const removeUser = id => {
    const removeIndex = users.findIndex(user => user.id === id)

    if(removeIndex!==-1)
        return users.splice(removeIndex, 1)[0]
}

const getUser = id => {
    return users.find(user => user.id === id)
}

const getUsersInRoom = room => {
    return users.filter(user => user.room === room)
}
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
        if(numberOfUsersInRoom <= 1){
        const { error, newUser} = addUser({
            id: socket.id,
            name: numberOfUsersInRoom===0 ? 'Player 1' : 'Player 2',
            room: data.room
        })
        socket.join(newUser.room)
        io.to(newUser.room).emit('roomData', {room: newUser.room, users: getUsersInRoom(newUser.room)})
        socket.emit('currentUserData', {name: newUser.name})
        }else{
            return callback("no se puede")
        }
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log("se desconecto el usuario: ", user.name, " del room : ", user.room)
        if(user)
            io.to(user.room).emit('roomData', {room: user.room, users: getUsersInRoom(user.room)})
    })

    socket.on('initGameState', gameState => {
        const user = getUser(socket.id)
        if(user)
            io.to(user.room).emit('initGameState', gameState)
    })
})


