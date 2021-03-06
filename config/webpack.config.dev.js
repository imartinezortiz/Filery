var HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
    mode: 'development',
    entry: ['./src/ts/index.ts'],
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        publicPath: 'http://localhost:8080/scripts/',
        library: 'Filery',
        libraryTarget: 'umd',
    },
    devtool: 'source-map',
    module: {
        rules: [{
            test: /\.ts$/,
            use: [
                'babel-loader',
                'ts-loader',
            ],
        }, {
            test: /\.scss$/,
            use: [
                "style-loader", // creates style nodes from JS strings
                "css-loader", // translates CSS into CommonJS
                "sass-loader" // compiles Sass to CSS, using Node Sass by default
            ]
        }, {
            test: /\.(png|jpg|gif)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192
                    }
                }
            ]
        }]
    }
    ,
    node: {
        fs: 'empty',
        net: 'empty',
        tls: 'empty',
    },
    plugins: [
        /*  new HtmlWebpackPlugin({
              inject: true,
              template: './static/index.html'
          })*/
    ],
}
