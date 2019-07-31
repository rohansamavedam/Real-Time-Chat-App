const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')

const app = express()
const server = http.createServer(app) //We created this for the purpose of passing server into socket.io
const io = socketio(server)

const port = 3000 || process.env.PORT

const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

app.get('', (req, res) => {

    res.render('index')

})


io.on('connection', (socket) => {

    console.log('New websocket connection')

    const welcomeMessage = 'Welcome!'

    socket.emit('message', welcomeMessage)

    socket.broadcast.emit('message', 'A new user has joined the chat room')

    socket.on('sendMessage', (message) => {
        io.emit('message', message)

    })

    socket.on('disconnect', () => {
        io.emit('message', 'A user has left the chat room')
    })

})




server.listen(port, () => {

    console.log('Running on port: ' + port)

})