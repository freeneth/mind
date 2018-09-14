
const path = require('path')
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
let webpack = require('webpack');
module.exports = merge(common, {
    
    plugins: [
        new webpack.DefinePlugin({
            ISPRODUCTION: JSON.stringify(true),
            'process.env.NODE_ENV': JSON.stringify('production'),
        }),
        new webpack.LoaderOptionsPlugin({
            options:{
                mode:'development'
            }
        }),
        new webpack.HotModuleReplacementPlugin()
    ],
    devtool: 'cheap-module-eval-source-map',
    devServer:{
        contentBase:'./dist',
        hot:true,
        inline:true
    }
})