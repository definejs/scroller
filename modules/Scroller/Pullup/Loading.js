const Loading = require('@definejs/loading');

module.exports = {
    /**
    * 
    *   options = {
    *       container: Element,
    *       bottom: 10,
    *   };
    */
    create(options) {
        let loading = new Loading({
            'container': options.container,
            'text': options.text,
            'presetting': 'scroller.pullup',
            'z-index': 9999,

            'style': {
                'bottom': options.bottom,
            },
        });

        return loading;
    },
};

