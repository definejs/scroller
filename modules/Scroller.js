
const $ = require('jquery');
const Emitter = require('@definejs/emitter');
const $Object = require('@definejs/object');
const Fn = require('@definejs/fn');

const Meta = require('./Scroller/Meta');
const IScroll = require('./Scroller/IScroll');
const Puller = require('./Scroller/Puller');
const Pulldown = require('./Scroller/Pulldown');
const Pullup = require('./Scroller/Pullup');

const mapper = new Map();


//阻止原生的 touchmove 事件。
let preventTouchMove = function () { 
    document.addEventListener('touchmove', function (e) {
        e.preventDefault();
    }, {
        passive: false,
    });
};





class Scroller {
    /**
    * 构造函数。
    * 已重载 Scroller(config);             //传入一个配置对象。
    * 已重载 Scroller(container, config);  //容器从配置对象中分离出来。
    */
    constructor(container, config) {
        //创建第一个实例之前，先调用一下。
        if (preventTouchMove) {
            preventTouchMove();
            preventTouchMove = null; //之后再也不需要调用了。
        }


        //重载 Scroller(config)
        if ($Object.isPlain(container)) {
            config = container;
            container = config.container;
        }


        config = $Object.deepAssign({}, exports.defaults, config);


        let emitter = new Emitter(this);

        let meta = Meta.create(config, {
            'container': container,
            'emitter': emitter,
            '$': $(container),
            'this': this,
        });

        mapper.set(this, meta);

        //对外暴露的属性。
        Object.assign(this, {
            'id': meta.id,
            '$': meta.$,
        });
    }


    // /**
    // * 当前实例的 id。
    // */
    // id = '';

    // /**
    // * 当前实例关联的 DOM 节点对应的 jQuery 实例。
    // * 即 $(container) 的快捷方式。
    // */
    // $ = null;

    // /**
    // * 原始的 IScroll 实例。
    // * 在调用 render() 后才存在。
    // */
    // iscroll = null;



    /**
    * 渲染。
    */
    render() {
        let meta = mapper.get(this);

        //已渲染。
        if (meta.scroller) {
            return;
        }

        meta.scroller = this.iscroll = IScroll.create(meta.container, meta.options);
        meta.$.addClass('definejs-scroller');
        meta.$.css(meta.style);

        Puller.bind(meta);
        Pulldown.bind(meta);
        Pullup.bind(meta);

    }

    /**
    * 刷新。
    * @param {number} delay 要延迟执行的时间。
    */
    refresh(delay, ...args) {
        let meta = mapper.get(this);
        let scroller = meta.scroller;
        let indicators = scroller.indicators || [];

        Fn.delay(delay, function () {
            scroller.refresh(...args);

            //隐藏全部滚动条
            indicators.forEach(function (item, index) {
                $(item).hide();
            });
        });
    }

    /**
    * 重置。
    */
    reset() {
        let meta = mapper.get(this);
        let scroller = meta.scroller;

        scroller.isWaitingForManualReset = false;
        scroller.resetPosition(scroller.options.bounceTime);
    }

    /**
    * 监控下拉动作。
    * 已重载 pulldown(load);       //设定下拉刷新时的加载函数。
    * 已重载 pulldown(options);    //设定复杂的选项。
    *   options = {
    *       min: 0,     //下拉开始生效的最小 y 值。
    *       max: 0,     //下拉结束生效的最大 y 值。
    *       top: 0,     //指示器最终停留的位置。
    *       release: 0, //释放后回弹到的位置。
    *       translateY, //初始时，指示器隐藏的位置。
    *       tips: {     //指示器的提示语集合。
    *           start: '↓ 下拉刷新',
    *           reach: '↑ 释放立即刷新',
    *           loading: '加载中...',
    *           success: '√ 刷新成功',
    *       },
    *       load: fn,   //下拉刷新时的加载函数。 如果指定此项，则会使用 KISP 内部实现的简单的下拉刷新的 UI 及功能。
    *   };
    */
    pulldown(options) {
        //重载 pulldown(load); 
        //设置下拉刷新的加载函数。
        if (typeof options == 'function') {
            options = { 'load': options, };
        }
        else {
            options = options || {};
        }


        let meta = mapper.get(this);
        let pulldown = Object.assign(meta.pulldown, options);
        let min = pulldown.min;
        let max = pulldown.max;

        if (min > max) {
            throw new Error(`参数 min 的值不能大于参数 max 的值。`);
        }

        if (!min && !max) {
            throw new Error(`参数 min 和 max 的值不能全为零。`);
        }

        pulldown.enabled = true;

        Puller.bind(meta);
        Pulldown.bind(meta);


    }

    /**
    * 监控上拉动作。
    * 已重载 pullup(load);       //设定上拉时的加载函数。
    * 已重载 pullup(options);    //设定复杂的选项。
    *   options = {
    *       min: 0,             //上拉开始生效的最小 y 值。
    *       max: 0,             //上拉结束生效的最大 y 值。
    *       bottom: 0,          //指示器最终停留的位置。
    *       release: 0,         //释放后回弹到的位置。
    *       translateY,         //初始时，指示器隐藏的位置。
    *       lastPage: false,    //是否为最后一页。 如果是，则表示没有更多数据，则停用上拉加载更多功能。
    *       tips: {             //指示器的提示语集合。
    *           start: '↑ 上拉加载更多',   //
    *           reach: '↓ 释放立即加载',   //
    *           loading: '加载中...',      //    
    *           lastPage: '已是最后一页',  //
    *       },
    *       load: fn,       //上拉时的加载函数。 如果指定此项，则会使用 KISP 内部实现的简单的上拉加载更多的 UI 及功能。
    *   };
    */
    pullup(options) {
        //重载 pullup(load); 
        //设置下拉刷新的加载函数。
        if (typeof options == 'function') {
            options = { 'load': options, };
        }
        else {
            options = options || {};
        }


        let meta = mapper.get(this);
        let pullup = Object.assign(meta.pullup, options);
        let min = pullup.min;
        let max = pullup.max;

        if (min > max) {
            throw new Error(`参数 min 的值不能大于参数 max 的值。`);
        }

        if (!min && !max) {
            throw new Error(`参数 min 和 max 的值不能全为零。`);
        }

        pullup.enabled = true;

        Puller.bind(meta);
        Pullup.bind(meta);


    }

    /**
    * 滚动到距离顶部的指定位置。
    * @param {number} y 相对于顶部的距离。
    */
    to(y) {
        let meta = mapper.get(this);
        let scroller = meta.scroller;
        let options = scroller.options;

        scroller.scrollTo(0, y, options.bounceTime, options.bounceEasing);
    }

    /**
    * 滚动到距离底部的指定位置。
    * @param {number} y 相对于底部的距离。
    */
    toBottom(y) {
        let meta = mapper.get(this);
        let scroller = meta.scroller;
        let options = scroller.options;
        let maxScrollY = scroller.maxScrollY;

        y = maxScrollY - y;

        scroller.scrollTo(0, y, options.bounceTime, options.bounceEasing);
    }

    /**
    * 启用或禁用本组件。
    */
    enable(enabled) {
        let meta = mapper.get(this);

        meta.enabled = !!enabled;

        if (meta.enabled) {
            meta.scroller.enable();
        }
        else {
            meta.scroller.disable();
        }

        return meta.enabled;
    }


    /**
    * 监听事件。
    */
    on(...args) {
        let meta = mapper.get(this);
        meta.emitter.on(...args);
    }

    /**
    * 销毁本实例对象。
    */
    destroy() {
        let meta = mapper.get(this);

        meta.emitter.destroy();
        meta.scroller.destroy();

        mapper.remove(this);
    }

}



Scroller.defaults = require('./Scroller.defaults');
module.exports = exports = Scroller;