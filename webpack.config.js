const Dotenv = require('dotenv-webpack');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './script.js',
    output: {
        filename: 'main.js',
        path: __dirname + '/dist',
    },
    plugins: [
        new Dotenv()
    ]
};
