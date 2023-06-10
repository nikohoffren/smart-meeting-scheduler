const Dotenv = require('dotenv-webpack');
const path = require('path');

module.exports = {
    mode: 'development',
    devtool: 'source-map',
    entry: './script.js',
    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'), // use path.resolve for cross-platform compatibility
    },
    module: {
        rules: [
            {
                test: /\.js$/, // to transpile JavaScript files
                exclude: /node_modules/, // excluding node_modules directory
                use: {
                    loader: "babel-loader", // use babel-loader for transpiling
                    options: {
                        presets: ["@babel/preset-env"], // using preset-env for compiling modern ES6+ code down to ES5
                    }
                }
            }
        ],
    },
    resolve: {
        alias: {
            // this configuration helps webpack understand Firebase's use of "browser" field specification of package.json
            // since webpack defaults to "module" field and it causes issue while bundling Firebase
            'firebase/app': path.resolve(__dirname, 'node_modules/firebase/app'),
            'firebase/auth': path.resolve(__dirname, 'node_modules/firebase/auth'),
            'firebase/firestore': path.resolve(__dirname, 'node_modules/firebase/firestore'),
        },
    },
    plugins: [
        new Dotenv()
    ]
};
