const Indicator = require('./Pulldown/Indicator');
const Loading = require('./Pulldown/Loading');


/**
* 简单的下拉刷新。
*/
module.exports = {
    
    bind(meta) {
        let opt = meta.pulldown;

        if (!opt.load || !opt.enabled || opt.binded) {
            return;
        }


        let tips = opt.tips;
        let isLoading = false;

        let indicator = Indicator.create({
            'container': meta.container,
            'translateY': opt.translateY,
        });

        let loading = Loading.create({
            'container': meta.container,
            'top': opt.top,
            'text': tips.loading,
        });


        opt.binded = true;


        //上拉时，把下拉的提示隐藏。
        meta.this.on('pullup', {
            'start'() {
                loading.hide();
                indicator.hide();
            },
        });


        meta.this.on('pulldown', {

            //让指示器跟着拉动位置，实现一种从上往下拉出来的效果。
            scroll(y, scroller) {
                let dy = y + opt.translateY;

                dy = Math.min(dy, 10);

                indicator.$.css({
                    'transform': `translateY(${dy}px)`,
                });
            },

            start() {
                if (isLoading) {
                    return;
                }

                loading.hide();
                indicator.show();
                indicator.$.html(tips.start);
            },

            enter() {
                if (isLoading) {
                    loading.show();
                }
            },

            reach() {
                if (isLoading) {
                    return;
                }

                indicator.$.html(tips.reach);
            },

            cancel() {
                loading.hide();

                indicator.$.css({
                    'transform': `translateY(${opt.translateY}px)`,
                });
            },

            release() {
                meta.this.to(opt.release);  //回弹到指定的位置。


                if (isLoading) {
                    return;
                }


                isLoading = true;
                loading.show();
                indicator.hide();

                //回调函数作为 done，传给使用者，必须显式调用一次以通知 load 结束。
                opt.load(function () {
                    isLoading = false;
                    loading.hide();

                    indicator.$.html(tips.success);
                    indicator.show();

                    setTimeout(function () { //reset
                        indicator.hide();
                        indicator.$.html(tips.start);
                        meta.this.reset();

                    }, 500);
                });
            },
        });


    },


};


