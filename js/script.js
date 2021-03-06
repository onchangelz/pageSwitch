(function($) {
    var defaults = {
        'container': '#container', //容器
        'sections': '.section', //子容器
        'easing': 'ease', //动画特效方式
        'duration': 1000, //每次动画的时间
        'pagenation': true, //是否显示分页
        'loop': false, //是否循环
        'keyBoard': true, //是否支持键盘
        'direction': 'vertical', //控制滑动的方向horizontal,vertical
        // 'onpageSwitch': function(pagenum) {}
    };
    var win = $(window),
        container, sections, opts = {},
        canScroll = true,
        iIndex = 0,
        arrElement = [];
    var SP = $.fn.switchPage = function(options) {
        opts = $.extend({}, defaults, options || {});
        container = $(opts.container);
        sections = container.find(opts.sections);
        sections.each(function() {
            arrElement.push($(this));
        });
        return this.each(function() {
            if (opts.direction == "horizontal") {
                initLayout();
            }
            if (opts.pagenation) {
                initPagenation();
            }
            if (opts.keyboard) {
                keyDown();
            }
        });
    };

    //横向布局初始化
    function initLayout() {
        var length = sections.length,
            width = (length * 100) + "%";
        cellWidth = (100 / length).toFixed(2) + "%";
        container.width(width).addClass("left");
        sections.width(cellWidth).addClass("left");
    }

    //初始化分页
    function initPagenation() {
        var length = sections.length;
        if (length) {

        }
        var pageHtml = '<ul id="pages"><li class="active"></li>';
        for (var i = 1; i < length; i++) {
            pageHtml += '<li></li>';
        }
        pageHtml += '</ul>';
        $("body").append(pageHtml);
    }

    //绑定键盘事件
    function keyDown() {
        var keydownId;
        win.keydown(function(e) {
            clearTimeout(keydownId);
            keydownId = setTimeout(function() {
                var keyCode = e.keyCode;
                if (keyCode == 37 || keyCode == 38) {
                    SP.moveSectionUp();
                } else if (keyCode == 39 || keyCode == 40) {
                    SP.moveSectionDown();
                }
            }, 150);
        });
    }

    //滚轮向上滑动事件
    SP.moveSectionUp = function() {
        if (iIndex) {
            iIndex--;
        } else if (opts.loop) {
            iIndex = arrElement.length - 1;
        }
        scrollPage(arrElement[iIndex]);
    };

    //滚轮向下滑动
    SP.moveSectionDown = function() {
        if (iIndex < (arrElement.length - 1)) {
            iIndex++;
        } else if (opts.loop) {
            iIndex = 0;
        }
        scrollPage(arrElement[iIndex]);
    };

    //页面滚动事件（私有方法）
    function scrollPage(element) {
        var dest = element.position();
        if (typeof dest === "undefined") {
            return;
        }
        initEffects(dest, element);
    }

    //  页面效果的渲染使用CSS3或者jQuery
    function initEffects(dest, element) {
        var transform = ["-webkit-transform", "-ms-transform", "-moz-transform", "transform"],
            transition = ["-webkit-transition", "-ms-transition", "-moz-transition", "transition"];
        canScroll = false;
        if (isSupportCss(transform) && isSupportCss(transition)) {
            var translate = "";
            if (opts.direction == "horizontal") {
                translate = "-" + dest.left + "px,0px,0px";
            } else {
                translate = "0px,-" + dest.top + "px,0px";
            }
            container.css({
                "transition": "all " + opts.duration + "ms " + opts.easing,
                "transform": "translate3d(" + translate + ")"
            });
            container.on("webkitTransitionEnd msTransitionend mozTransitionend transitionend", function() {
                canScroll = true;
            });
        } else {
            var cssObj = (opts.direction == "horizontal") ? {
                left: -dest.left
            } : {
                top: -dest.top
            };
            container.animate(cssObj, opts.duration, function() {
                canScroll = true;
            });
        }
        element.addClass('active').siblings().removeClass('active');
        if (opts.pagenation) {
            pagenationHandler();
        }
    }

    //  是否支持css的property属性
    function isSupportCss(property) {
        var body = $("body")[0];
        for (var i = 0; i < property.length; i++) {
            if (property[i] in body.style) {
                return true;
            }
        }
        return false;
    }

    //分页
    function pagenationHandler() {
        var pages = $("#pages li");
        pages.eq(iIndex).addClass('active').siblings().removeClass("active");
    }

    //为鼠标绑定滚轮事件
    $(document).on("mousewheel DOMMouseScroll", MouseWheelHandler);

    function MouseWheelHandler(e) {
        e.preventDefault();
        var value = e.originalEvent.wheelDelta || -e.originalEvent.detail;
        var delta = Math.max(-1, Math.min(1, value));
        if (canScroll) {
            if (delta < 0) {
                SP.moveSectionDown();
            } else {
                SP.moveSectionUp();
            }
        }
        return false;
    }

    //窗口Resize
    var resizeId;
    win.resize(function() {
        clearTimeout(resizeId);
        resizeId = setTimeout(function() {
            reBuild();
        }, 500);
    });

    function reBuild() {
        var currentHeight = win.height(),
            currentWidth = win.width();
        var element = arrElement[iIndex];
        if (opts.direction == "horizontal") {
            var offsetLeft = element.offset().left;
            if (Math.abs(offsetLeft) > currentWidth / 2 && iIndex < (arrElement.length - 1)) {
                iIndex++;
            }
        } else {
            var offsetTop = element.offset().top;
            if (Math.abs(offsetTop) > currentHeight / 2 && iIndex < (arrElement.length - 1)) {
                iIndex++;
            }
        }
        if (iIndex) {
            pagenationHandler();
            var cuerrentElement = arrElement[iIndex],
                dest = cuerrentElement.position();
            initEffects(dest, cuerrentElement);
        }
    }
})(jQuery);
