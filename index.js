
//<--for.webpack.begin-->
//针对在 webpack 环境中，自动引入样式。
if ('webpackPolyfill' in module) {
    require('./modules/Scroller.less');
}
//<--for.webpack.end-->

module.exports = require('./modules/Scroller');
module.exports.defaults = require('./modules/Scroller.defaults');