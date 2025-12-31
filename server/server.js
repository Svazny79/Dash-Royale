const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('../public'));

let waitingPlayer = null;

io.on('connection', socket => {
  if (waitingPlayer) {
    socket.room = waitingPlayer.room;
    socket.join(socket.room);
    io.to(socket.room).emit('startMatch');
    waitingPlayer = null;
  } else {
    socket.room = socket.id;
    socket.join(socket.room);
    waitingPlayer = socket;
  }

  socket.on('spawnTroop', data => {
    io.to(socket.room).emit('spawnTroop', data);
  });

  socket.on('disconnect', () => {
    if (waitingPlayer === socket) waitingPlayer = null;
  });
});

http.listen(3000, () => {
  console.log('Dash Royale running at http://localhost:3000');
});
