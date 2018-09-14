
const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
module.exports = merge(common, {
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    compress: {
                        drop_console: true
                    }
                }
            })
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.LoaderOptionsPlugin({
            options:{
                mode: 'production'
            }
        }),
        new BundleAnalyzerPlugin(),
    ],
    devtool: 'source-map',
})
