const express = require('express')
const socketio = require('socket.io')
const users = []

const addUser = ({id, name, sala}) => {
    const numberOfUsersInsala = users.filter(user => user.sala === sala).length
    if(numberOfUsersInsala === 4)
    return { error: 'llena' }

    const newUser = { id, name, sala }
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
        if(numberOfUsersInsala <= 1){
        const { error, newUser} = addUser({
            id: socket.id,
            name: numberOfUsersInsala===0 ? 'Player 1' : 'Player 2',
            sala: data.sala
        })
        socket.join(newUser.sala)
        io.to(newUser.sala).emit('salaData', {sala: newUser.sala, users: getUsersInsala(newUser.sala)})
        socket.emit('currentUserData', {name: newUser.name})
        }else{
            return callback("no se puede")
        }
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        console.log("se desconecto el usuario: ", user.name, " del sala : ", user.sala)
        if(user)
            io.to(user.sala).emit('salaData', {sala: user.sala, users: getUsersInsala(user.sala)})
    })

    socket.on('initGameState', gameState => {
        const user = getUser(socket.id)
        if(user)
            io.to(user.sala).emit('initGameState', gameState)
    })
})


