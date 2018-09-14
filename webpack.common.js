const path =require('path');
const HtmlWebpackPlugin =require('html-webpack-plugin');
const CleanWebpackPlugin =require('clean-webpack-plugin');

module.exports = {
    entry:{
       app:path.resolve(__dirname,'./main.js')
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
    },
    module: {
        rules: [
            {
                test: /.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        plugins: 'transform-runtime',
                    },
                },
            },
            {
                test: /.css$/,
                use: [
                    {loader: 'style-loader'},
                    {loader: 'css-loader'},
                ],
            },
            {
                test: /\.(png|jpg|gif)$/,
                use: 'url-loader',
            },
        ],
    },
    plugins:[
        new CleanWebpackPlugin(['dist']),
        new HtmlWebpackPlugin({
            template:'./index.html'
        }),
        
    ]
};
