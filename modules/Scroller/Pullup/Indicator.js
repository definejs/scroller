//公共模块。
const $ = require('jquery');
const $String = require('@definejs/string');
const Panel = require('@definejs/panel');

//子模块。
const Sample = require('./Indicator/Sample');


module.exports = {
    /**
    * 创建一个指示器 Panel 实例。
    *   options = {
    *       container: Element,     //Scroller 容器节点。
    *       translateY: 40,         //隐藏在底部的位置。
    *   };
    */
    create(options) {
        let id = $String.random();

        let html = $String.format(Sample, {
            'id': id,
            'translateY': options.translateY,
        });

        $(options.container).append(html);

        let panel = new Panel(`#${id}`);

        return panel;
    },
};


