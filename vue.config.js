const path = require('path')
const webpack = require('webpack')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}


module.exports = {
  configureWebpack: {
    devtool: 'source-map',
    resolve: {
      alias: {
        '@': resolve('src'),
        'jquery': 'jquery' 
      }
    },
    plugins: [
      new webpack.ProvidePlugin({
        $: "jquery",
        jQuery: "jquery",
        jquery: "jquery",
        "window.jQuery": "jquery"
        })
      ],
  },
} 