const Loading = require('@definejs/loading');

module.exports = {
    /**
    * 创建一个加载指示器。
    *   options = {
    *       container: Element,     //Scroller 容器节点。
    *       text: '',               //要显示的文本，如 `加载中...`。
    *       top: 10,                //样式 `top` 值。
    *   };
    */
    create(options) {
        let loading = new Loading({
            'container': options.container,
            'text': options.text,
            'presetting': 'scroller.pulldown',
            'z-index': 9999,
            'style': {
                'top': options.top,
            },
        });

        return loading;
    },
};


