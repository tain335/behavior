const base = require('./base.config.js');
const merge = require('webpack-merge');
const webpack = require('webpack');

const config = merge(base, {
    mode: 'production'
});

webpack(config).run((err, stats) => {
    if(err) throw err;
    process.stdout.write(stats.toString({
        colors: true,
        modules: false,
        children: false,
        chunks: false,
        chunkModules: false
    }) + '\n');
});
