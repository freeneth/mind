/* global __dirname */
const path = require('path')
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
module.exports = merge(common, {
    entry: {
        graph: path.resolve('./src/indexMindMap.jsx'),
        share: path.resolve('./src/indexShareMind.jsx'),
        test: path.resolve('./src/treeStore_test.js'),
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    plugins: [
        new UglifyJSPlugin({
            parallel: true,
        }),
    ],
    devtool: 'cheap-module-eval-source-map',
})
