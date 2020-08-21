const $ = require('jquery');
const $String = require('@definejs/string');
const Panel = require('@definejs/panel');
const Sample = require('./Indicator/Sample');

module.exports = {
    /**
    * 创建一个Panel 实例指示器。
    *   options = {
    *       container: Element,     //Scroller 容器节点。
    *       translateY: -40,        //隐藏在顶部的位置。
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


