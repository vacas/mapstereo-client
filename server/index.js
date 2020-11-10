const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

// For Socket.io
const socketIo = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';

const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

let currentState = {};

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    const parsedUrl = parse(req.url, true);

    handle(req, res, parsedUrl);
  }).listen(PORT, (err) => {
    if (err) throw err;
    console.log(`server started on port ${PORT}`);
  });

  const io = socketIo(server);

  io.on('connect', (socket) => {
    console.log('this guy connected');

    socket.emit('receivingChanges', currentState);
  });

  io.on('connection', (socket) => {
    socket.on('recording', (data) => {
      console.log('recording', data);

      socket.broadcast.emit('recordingInProgress', data);
    });
    socket.on('sendingChanges', (data) => {
      console.log('sending changes data', data);
      currentState = {
        ...currentState,
        lists: (data && data.lists) || currentState.lists,
        boxes: (data && data.boxes) || currentState.boxes,
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
});