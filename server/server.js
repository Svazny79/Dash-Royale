const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('../public'));

let waiting = null;

io.on('connection', socket => {
  if (waiting) {
    socket.room = waiting.room;
    socket.join(socket.room);
    io.to(socket.room).emit('start');
    waiting = null;
  } else {
    socket.room = socket.id;
    socket.join(socket.room);
    waiting = socket;
  }

  socket.on('playCard', data => {
    io.to(socket.room).emit('playCard', data);
  });

  socket.on('disconnect', () => {
    if (waiting === socket) waiting = null;
  });
});

http.listen(3000, () => {
  console.log('Dash Royale live at http://localhost:3000');
});
