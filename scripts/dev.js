const base = require('./base.config.js');
const merge = require('webpack-merge');
const WebpackDevServer = require('webpack-dev-server');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');

const compiler = webpack(merge(base, {
    devtool: "hidden-source-map",
    entry: {
        index: "./examples/index.ts",
        gesture: './examples/gesture.ts'
    },
    plugins: [
        new HTMLWebpackPlugin({
            title: 'Flyme游戏中心活动',
            filename: 'index.html',
            inject: 'body',
            template: './examples/index.html',
            chunks: ['index']
        }),
        new HTMLWebpackPlugin({
            title: 'Flyme游戏中心活动',
            filename: 'gesture.html',
            inject: 'body',
            template: './examples/gesture.html',
            chunks: ['gesture']
        })
    ]
}));

let server = new WebpackDevServer(compiler, {
    publicPath: "/",
    contentBase: "../examples",
    hot: true,
    historyApiFallback: false,
    compress: false,
    clientLogLevel: "info",
    quiet: false,
    noInfo: false,
    lazy: false,
    disableHostCheck: true,
    overlay: {
        warnings: false,
        errors: true
    },
    watchOptions: {
        aggregateTimeout: 200,
        ignored: /node_modules/
    },
    stats: { colors: false }
});
server.listen(8080, "0.0.0.0");