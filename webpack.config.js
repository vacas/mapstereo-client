const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    app: ['./src/index.tsx'],
    vendor: ['react', 'react-dom'],
    polyfill: ['./src/polyfill.js'],
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
  // devtool: 'source-map',
  devServer: {
    hot: true,
    // watchContentBase: true,
    historyApiFallback: true,
    disableHostCheck: true,
    contentBase: '.',
    port: 3000,
    watchOptions: {
      ignored: [
          path.resolve(__dirname, 'dist'),
          path.resolve(__dirname, 'node_modules'),
      ]
  }
  },
};