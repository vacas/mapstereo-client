const path = require('path');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const io = require('./ws');

app.use(express.static(path.join(__dirname, '../dist')));

// I'm maintaining all active connections in this object
const clients = {};

// This code generates unique userid for everyuser.
const getUniqueID = () => {
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return s4() + s4() + '-' + s4();
};

io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('sendingChanges', (data) => {
    console.log('sending changes data', data);
    
    socket.broadcast.emit('receivingChanges', data);
  })
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  })
  // var userID = getUniqueID();
  // console.log((new Date()) + ' Recieved a new connection from origin ' + request.origin + '.');
  // // You can rewrite this part of the code to accept only the requests from allowed origin
  // const connection = request.accept(null, request.origin);
  // clients[userID] = connection;
  // console.log('connected: ' + userID + ' in ' + Object.getOwnPropertyNames(clients));

  // connection.on('message', (data) => {
  //   console.log(data);
  // })
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
});
