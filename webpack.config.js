const path = require('path');

module.exports = {
  entry: './src/index.tsx',
  mode: "development",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: ['ts-loader'],
        exclude: /node_modules/,
      },
      {
        test: /\.css$/i,
        use: [
            "style-loader",
            'css-loader',
            "postcss-loader",
        ],
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.css'],
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
};