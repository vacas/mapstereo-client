const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const socketIo = require('socket.io');
const INDEX_PATH = '../dist';
// const INDEX_PATH = process.env.NODE_ENV === 'production' ? '../dist' : '../public';
let currentState = {};

app.use(express.static(path.join(__dirname, INDEX_PATH)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, `${INDEX_PATH}/index.html`));
});

const server = app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});

const io = socketIo(server);

io.on('connect', (socket) => {
  console.log('this guy connected');
  
  socket.emit('receivingChanges', currentState);
})

io.on('connection', (socket) => {
  socket.on('recording', (data) => {
    console.log('recording', data);

    socket.broadcast.emit('recordingInProgress', data);
  })
  socket.on('sendingChanges', (data) => {
    console.log('sending changes data', data);
    currentState = {
      ...currentState,
      lists: data && data.lists || currentState.lists,
      boxes: data && data.boxes || currentState.boxes,
    };

    socket.broadcast.emit('receivingChanges', data);
  });
  socket.on('disconnect', () => {
    console.log(`Total connected: ${socket.client.conn.server.clientsCount}`);
    
    console.log('Client disconnected');
    setTimeout(() => {
      if (socket.client.conn.server.clientsCount === 0) {
        currentState = {};
      }
    }, 500);

  });
  socket.on('draw_cursor', (data) => {
    console.log('data', data);
    
    socket.broadcast.emit('draw_cursor', { line: data.line, id: socket.id });
  });
});