const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('../src/util/messages')

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

    socket.on('join', ({ username, room }) => {
        socket.join(room)

        socket.emit('message', generateMessage(welcomeMessage))
        socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined the chat.`))


    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.emit('message', generateMessage(message))
        callback()

    })

    socket.on('sendLocation', (location, callback) => {
        const message = 'https://google.com/maps?q=' + location.lat + ',' + location.long
        io.emit('locationMessage', generateMessage(message))
        callback('Location Shared')
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left the chat room'))
    })

})




server.listen(port, () => {

    console.log('Running on port: ' + port)

})