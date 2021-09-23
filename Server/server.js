const express = require('express')
const socketio = require('socket.io')
const users = []

const addUser = ({id, name, sala, userName}) => {
    const numberOfUsersInsala = users.filter(user => user.sala === sala).length
    if(numberOfUsersInsala === 3)
    return { error: 'llena' }

    const newUser = { id, name, sala, userName }
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

const getUsersInsala = sala => {
    return users.filter(user => user.sala === sala)
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
        let numberOfUsersInsala = getUsersInsala(data.sala).length
        let nombre
        if(numberOfUsersInsala === 0){
            nombre = 'Player 1'
        }else if(numberOfUsersInsala === 1){
            nombre = 'Player 2'
        }else if(numberOfUsersInsala === 2){
            nombre = 'Player 3'
        }
        const { error, newUser} = addUser({
            id: socket.id,
            name: nombre,
            sala: data.sala,
            userName: data.userName
        })

        if(error){
            return callback(error)}
        else{ 
            socket.join(newUser.sala)
            io.to(newUser.sala).emit('salaData', {sala: newUser.sala, users: getUsersInsala(newUser.sala)})
            socket.emit('currentUserData', { userName: newUser.userName, name: newUser.name})
            callback()}
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if(user)
            io.to(user.sala).emit('salaData', {sala: user.sala, users: getUsersInsala(user.sala)})
    })

    socket.on('initGameState', gameState => {
        const user = getUser(socket.id)
        if(user)
            io.to(user.sala).emit('initGameState', gameState)
    })

    socket.on('updateGameState', gameState => {
        const user = getUser(socket.id)
        if(user)
            io.to(user.sala).emit('updateGameState', gameState)
            console.log("dentro del if ", user, gameState)
        console.log("fuera del if ", user, gameState)
    })

    socket.on('sendMessage', (payload, callback) => {
        const user = getUser(socket.id)
        const data = Object.values(user)
        io.to(data[2]).emit('message', {user: user.name, name: user.userName, text: payload.message})
        callback()
    })

})