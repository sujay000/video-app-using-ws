const express = require('express')
const app = express()
const http = require('http')
const port = 5000

const server = http.createServer(app)
const io = require('socket.io')(server, {
    cors: {
        origin: '*',
    },
})

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`)

    socket.emit('me', socket.id)

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`)
        socket.broadcast.emit('callEnded')
    })

    socket.on('callOther', ({ textInput, data }) => {
        console.log(textInput)
        io.to(textInput).emit('callIncoming', {
            id: socket.id, // call initiator's id
            data: data,
        })
    })

    socket.on('acceptedTheCall', ({ hisID, data }) => {
        io.to(hisID).emit('heAccepted', data)
    })
})

server.listen(port, () => {
    console.log(`listening on port ${port}`)
})
