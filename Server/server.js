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
})





