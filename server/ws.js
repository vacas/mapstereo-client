const webSocketsServerPort = 4001;
const socketIo = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = socketIo(server);
server.listen(webSocketsServerPort);

module.exports = io;