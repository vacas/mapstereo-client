const webSocketsServerPort = 4001;
const socketIo = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = socketIo(server);
server.listen(webSocketsServerPort);

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('recording', (data) => {
    console.log('recording', data);
    
    socket.broadcast.emit('recordingInProgress', data);
  })
  socket.on('sendingChanges', (data) => {
    console.log('sending changes data', data);
    
    socket.broadcast.emit('receivingChanges', data);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
  socket.on('draw_cursor', (data) => {
    console.log('data', data);
    
    socket.broadcast.emit('draw_cursor', { line: data.line, id: socket.id });
  });
});

module.exports = io;