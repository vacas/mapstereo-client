require('dotenv').config();
const webpack = require('webpack');
const path = require('path');
const socketIo = require('socket.io');
const S3 = require('aws-sdk/clients/s3');
const multer  = require('multer');
const upload = multer();
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const s3 = new S3({apiVersion: '2006-03-01'});

console.log('process.env.AWS_BUCKET', process.env.AWS_BUCKET);

module.exports = {
  entry: {
    app: ['./src/index.tsx'],
    vendor: ['react', 'react-dom'],
},
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].bundle.js',
    publicPath: '/',
  },
  devtool: 'source-map',
  module: {
    rules: [
      { 
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
            'style-loader',
            'css-loader',
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/,
        exclude: /node_modules/,
        use: ['file-loader?name=[name].[ext]']
      }
    ],
  },
  plugins: [
    new MiniCssExtractPlugin(),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
      debug: false,
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, './public/index.html'),
      filename: 'index.html'
    })
  ],
  resolve: {
    extensions: [ '.tsx', '.ts', '.js', '.jsx', '.webpack.js', '.json' ],
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ]
  },
  devServer: {
    before: function(app) {
      // need to make this modular to use in server and here, but will leave like this for the time being for faster development

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
    },
    contentBase: '.',
    disableHostCheck: true,
    historyApiFallback: true,
    hot: true,
    onListening: function(server) {
      // need to make this modular to use in server and here, but will leave like this for the time being for faster development
      let currentState = {};
      const io = socketIo(server.listeningApp);

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
    },
    port: 3000,
    watchOptions: {
      ignored: [
          path.resolve(__dirname, 'dist'),
          path.resolve(__dirname, 'node_modules'),
      ]
    },
  },
};