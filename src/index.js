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


let count = 0

io.on('connection', (socket) => {
    console.log('New websocket connection')

    socket.emit('countUpdated', count)

    socket.on('increment', () => {
        count++
        //socket.emit('countUpdated', count) //This line only emits to a particular connection, so the other connection needs to be refreshed to see the change
        io.emit('countUpdated', count) //This one emits to every single connnection
    })
})




server.listen(port, () => {
    console.log('Running on port: ' + port)
})