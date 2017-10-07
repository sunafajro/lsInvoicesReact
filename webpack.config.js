const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: [
    './index.js'
  ],

  devtool: 'cheap-module-source-map',
  
  module: {
      loaders: [{
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        query: {
          presets: ['env', 'stage-2', 'react']
        }
      }]
    },
    resolve: {
      extensions: ['*', '.js', '.jsx']
    },

  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'bundle.js'
  },
};