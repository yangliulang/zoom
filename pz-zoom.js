(function() {
  /**
	@基于jQuery的放大镜查看图片细节插件
	@无需关注js的的内部实现，只要修改css即可达自由布局模式。
	@内部实现了根据不同细节图的大小来自适应查看
	@杨永
	@QQ:377746756
	@call:18911082352
	@版本:1.0
	*/
  function JPZZoom(object) {
    var _this_ = this;
    //保存传进来的放大镜对象
    this.zoomObject = object;
    //保存放大镜的钩子
    this.zoomHook = $('.J_ZoomHook', object);
    //保存钩子图，也就是中图
    this.hookImg = $('.J_ImagesHook', this.zoomHook);
    //获取放大镜钩子区域的尺寸
    this.hookClient = {
      width: this.zoomHook.width(),
      height: this.zoomHook.height()
    };
    //保存钩子内的滑块
    this.slider = $('.J_Slider', this.zoomHook);
    //保存放大镜细节区域
    this.detailBox = $('.J_ZoomDetail', object);
    //获取放大镜细节区域的尺寸
    this.detailClient = {
      width: this.detailBox.width(),
      height: this.detailBox.height()
    };
    //保存细节图对象
    this.detailImg = $('.J_ZoomDetailImage', this.detailBox);
    //当默认的大图载入完成后执行函数内容
    this.preLoadImg(this.detailImg.attr('src'), function() {
      _this_.detailImgLoadedCallBack();
    });
    //绑定移动，移除，移入事件
    this.zoomHook
      .mousemove(function(e) {
        //获取鼠标的坐标值
        var x = _this_.getLayerPosition(this, e).layerX,
          y = _this_.getLayerPosition(this, e).layerY;
        //驱动滑块的位置
        _this_.setSliderPosition(
          _this_.getPracticalOffset(x, y).x,
          _this_.getPracticalOffset(x, y).y
        );
        //驱动细节图位置
        _this_.setDetailImgPosition(
          _this_.getPracticalOffset(x, y).x,
          _this_.getPracticalOffset(x, y).y
        );
      })
      .mouseover(function() {
        _this_.slider.show();
        _this_.detailBox.css('visibility', 'visible');
      })
      .mouseout(function(e) {
        try {
          if (e.relatedTarget.tagName != 'SPAN') {
            _this_.slider.hide();
            _this_.detailBox.css('visibility', 'hidden');
          }
        } catch (e) {
          //如果移出的是其他应用程序界面（如QQ）,也表示移出了，就执行隐藏滑块和细节大图。
          _this_.slider.hide();
          _this_.detailBox.css('visibility', 'hidden');
        }
      });
    //获取小预览图对象
    this.imagesViewBox = $('.J_ImagesView', object);
    //获取所有小图列表
    this.viewList = this.imagesViewBox.find('img');
    //绑定小图事件
    this.viewList.click(function() {
      _this_.setImgSrc($(this));
    });
    //获取小图列表的父节点的宽度
    this.slideWrapWidth = $('.J_SlideWrap', object).width();
    //获取单个小图的宽度
    this.littleImgWidth = this.imagesViewBox
      .children()
      .eq(0)
      .width();
    //获取小图的个数
    this.littleImgSize = this.imagesViewBox.children().size();
    //获取单个小图的margin值
    this.littleImgMarginRight = parseInt(
      this.imagesViewBox
        .children()
        .eq(0)
        .css('marginRight')
    );
    //如果小图已经溢出,就启用切换效果
    if (this.isOverflow()) {
      //设置幻灯片的宽度
      this.imagesViewBox.width(
        (this.littleImgWidth + this.littleImgMarginRight) *
          (this.littleImgSize + 1)
      );
      //获取左右切换按钮
      this.btnL = $('.btnL', object);
      this.btnR = $('.btnR', object);
      //绑定事件
      this.btnL
        .hover(
          function() {
            $('em', this).css('display', 'block');
          },
          function() {
            $('em', this).css('display', 'none');
          }
        )
        .click(function() {
          _this_.animateSlide(this);
        });
      this.btnR
        .hover(
          function() {
            $('em', this).css('display', 'block');
          },
          function() {
            $('em', this).css('display', 'none');
          }
        )
        .click(function() {
          _this_.animateSlide(this);
        });
    }
  }
  JPZZoom.prototype = {
    animateSlide: function(thisObj) {
      if ($(thisObj).hasClass('btnL')) {
        this.imagesViewBox
          .css(
            'left',
            -(this.littleImgWidth + this.littleImgMarginRight) + 'px'
          )
          .children()
          .last()
          .prependTo(this.imagesViewBox);
        this.imagesViewBox.animate({ left: 0 });
      } else {
        this.imagesViewBox.animate(
          { left: -(this.littleImgWidth + this.littleImgMarginRight) + 'px' },
          function() {
            $(this)
              .css('left', 0)
              .children()
              .eq(0)
              .appendTo(this);
          }
        );
      }
    },
    //判断小图列表是否超出，返回true/false
    isOverflow: function() {
      return (this.littleImgWidth + this.littleImgMarginRight) *
        this.littleImgSize >
        this.slideWrapWidth
        ? true
        : false;
    },
    //设置中图，大细节图的src地址和更改选中样式
    setImgSrc: function(thisObj) {
      var _this = this;
      //拿到小图节点上的src地址
      var hookSrc = thisObj.attr('medium-img'),
        detailSrc = thisObj.attr('large-img');
      //设置hook钩子图片地址
      this.hookImg.attr('src', hookSrc);
      //当切换的细节大图加载完成后，执行替换src和执行detailImgLoadedCallBack();
      this.preLoadImg(detailSrc, function() {
        //替换掉细节图地址
        _this.detailImg.attr('src', detailSrc);
        //执行detailImgLoadedCallBack(),该函数是用来更改相关比例数据和设置滑块的尺寸;
        _this.detailImgLoadedCallBack();
      });
      //切换选中样式
      thisObj
        .parent()
        .addClass('selected')
        .siblings()
        .removeClass('selected');
    },
    //图片加载器
    preLoadImg: function(url, callBack) {
      var img = new Image();
      if (!!window.ActiveXObject) {
        img.onreadystatechange = function() {
          if (this.readyState == 'complete') {
            callBack();
          }
        };
      } else {
        img.onload = function() {
          callBack();
        };
      }
      img.src = url;
    },
    //获取鼠标相对于当前元素的坐标
    getLayerPosition: function(currentElement, evt) {
      return {
        layerX: evt.pageX - $(currentElement).offset().left,
        layerY: evt.pageY - $(currentElement).offset().top
      };
    },
    //根据滑块的的尺寸获取实际能够驱动滑块的坐标
    getPracticalOffset: function(x, y) {
      if (x <= this.sliderClient.width / 2) {
        x = 0;
      } else if (x >= this.hookClient.width - this.sliderClient.width / 2) {
        x = this.hookClient.width - this.sliderClient.width;
      } else {
        x = x - this.sliderClient.width / 2;
      }
      if (y <= this.sliderClient.height / 2) {
        y = 0;
      } else if (y >= this.hookClient.height - this.sliderClient.height / 2) {
        y = this.hookClient.height - this.sliderClient.height;
      } else {
        y = y - this.sliderClient.height / 2;
      }
      return { x: x, y: y };
    },
    //设置滑块的位置,同时返回滑块的坐标值
    setSliderPosition: function(x, y) {
      this.slider.css({ left: x + 'px', top: y + 'px' });
    },
    //设置细节图的位置
    setDetailImgPosition: function(x, y) {
      this.detailImg.css({
        left: -(x * this.getMultiple().XMultiple) + 'px',
        top: -(y * this.getMultiple().YMultiple) + 'px'
      });
    },
    //获取两者之间的关系倍数
    getMultiple: function() {
      return {
        XMultiple:
          (this.detailImgClient.width - this.detailClient.width) /
          (this.hookClient.width - this.sliderClient.width),
        YMultiple:
          (this.detailImgClient.height - this.detailClient.height) /
          (this.hookClient.height - this.sliderClient.height)
      };
    },
    //设置滑块的尺寸
    setSliderClient: function() {
      /********************谷歌在解析这段的时候注意细节大图的尺寸问题infiny************************************************/
      var multipleX =
          this.hookClient.width /
          (this.detailImgClient.width / this.detailClient.width),
        multipleY =
          this.hookClient.height /
          (this.detailImgClient.height / this.detailClient.height);
      this.slider.css({
        width: multipleX + 'px',
        height: multipleY + 'px'
      });
      //设置完成之后，重置默认尺寸
      this.sliderClient = {
        width: this.slider.width(),
        height: this.slider.height()
      };
    },
    //切换大图时，当大图载入完毕后，执行函数
    detailImgLoadedCallBack: function() {
      //获取默认细节图的尺寸
      this.detailImgClient = {
        width: this.detailImg.width(),
        height: this.detailImg.height()
      };
      //根据比例倍数设置滑块的尺寸
      this.setSliderClient();
      //获取滑块的默认尺寸（设置完成的尺寸）
      this.sliderClient = {
        width: this.slider.width(),
        height: this.slider.height()
      };
    }
  };
  JPZZoom.init = function(zooms) {
    var _this_ = this;
    zooms.each(function(i, o) {
      new _this_(this);
    });
  };

  window['JPZZoom'] = JPZZoom;
})();
