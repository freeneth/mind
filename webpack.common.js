module.exports = {
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
};
