import Dotenv from 'dotenv-webpack';

export const mode = 'development';
export const devtool = 'source-map';
export const entry = './script.js';
export const output = {
    filename: 'main.js',
    path: __dirname + '/dist',
};
export const plugins = [
    new Dotenv()
];
