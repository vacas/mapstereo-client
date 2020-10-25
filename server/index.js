require('dotenv').config();
const path = require('path');
const express = require('express');
const S3 = require('aws-sdk/clients/s3');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const multer  = require('multer');
const upload = multer();
const app = express();
const PORT = process.env.PORT || 3000;
const INDEX_PATH = '../dist';
let currentState = {};

const s3 = new S3({apiVersion: '2006-03-01'});

app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, INDEX_PATH)));

// need to add authorization bearer
app.post('/upload', upload.single('soundBlob'), async (req, res) => {
  await s3.upload({
    Bucket: process.env.AWS_BUCKET,
    Key: req.file.originalname,
    Body: Buffer.from(new Uint8Array(req.file.buffer))
  }, async (err, data) => {
    if (err) {
      console.log('error: ', err);
      res.sendStatus(404);
    }
    
    res.send(`https://${process.env.AWS_BUCKET}/${escape(req.file.originalname)}`);
  });
})

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