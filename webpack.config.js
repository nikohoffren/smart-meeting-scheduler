const Dotenv = require('dotenv-webpack');

module.exports = {
    entry: './script.js',
    output: {
        filename: 'main.js',
        path: __dirname + '/dist',
    },
    plugins: [
        new Dotenv()
    ]
};
