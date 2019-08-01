const http = require('http')
const path = require('path')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage } = require('../src/util/messages')
const { addUser, getUser, getUsersInRoom, removeUser } = require('../src/util/users')

const app = express()
const server = http.createServer(app) //We created this for the purpose of passing server into socket.io
const io = socketio(server)

const port = process.env.PORT

const publicDir = path.join(__dirname, '../public')

app.use(express.static(publicDir))

app.get('', (req, res) => {

    res.render('index')

})


io.on('connection', (socket) => {
    console.log('New websocket connection')

    const welcomeMessage = 'Welcome!'

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room })

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('admin', welcomeMessage))
        socket.broadcast.to(user.room).emit('message', generateMessage('admin', `${user.username} has joined the chat.`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)

        })

        callback()

    })

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateMessage(user.username, message))
        callback()

    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id)
        const message = 'https://google.com/maps?q=' + location.lat + ',' + location.long
        io.to(user.room).emit('locationMessage', generateMessage(user.username, message))
        callback('Location Shared')
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user){
            io.to(user.room).emit('message', generateMessage('admin', `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
    
            })
        }   
    })

})




server.listen(port, () => {

    console.log('Running on port: ' + port)

})