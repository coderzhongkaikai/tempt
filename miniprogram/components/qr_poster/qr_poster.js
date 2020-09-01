// components/qr_poster/qr_poster.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    info: Object,
    Qrimage:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    name: "", // 活动标题
    time: "2020/22", // 
    posterUrl: "cloud://release-cfpbk.7265-release-cfpbk-1301655434/qr_image.png", // 海报地址
    qrcodeUrl: "cloud://release-cfpbk.7265-release-cfpbk-1301655434/qrcode/1587617533535-0.056692268751521.png", // 小程序二维码
    // 设置区，针对部件的数据设置
    photoDiam: 50, // 头像直径
    qrcodeDiam: 80, // 小程序码直径
    infoSpace: 20, // 底部信息的间距
    saveImageWidth: 500, // 保存的图像宽度
    bottomInfoHeight: 100, // 底部信息区高度
    tips: "微信扫码查看活动内容", // 提示语
    // 缓冲区，无需手动设定
    canvasWidth: 0, // 画布宽
    canvasHeight: 0, // 画布高
    canvasDom: null, // 画布dom对象
    canvas: null, // 画布的节点
    ctx: null, // 画布的上下文
    dpr: 1, // 设备的像素比
    posterHeight: 0, // 海报高
    tempFilePath: ''
  },
  ready: function () {
    wx.hideLoading()
    const Qrimage=this.properties.Qrimage
    const {
      name,
      activity_time,
      img
    } = this.properties.info
    console.log(this.properties.info)
    console.log(img)
    let showname = name
    if (name.length > 10) {
      showname = name.slice(0, 10) + '...'
    }
    this.setData({
      name: showname, // 活动标题
      time: activity_time, // 
      posterUrl: img.activity_img || 'cloud://release-cfpbk.7265-release-cfpbk-1301655434/qr_image.png', // 海报地址
      qrcodeUrl: Qrimage
    }, () => {
      console.log(this.data)
      this.drawImage()
    })

  },
  /**
   * 组件的方法列表
   */
  methods: {
    // 查询节点信息，并准备绘制图像
    drawImage() {
      //自定义组件特殊的查询dom
      const query = wx.createSelectorQuery().in(this) // 创建一个dom元素节点查询器
      query.select('#canvasBox') // 选择我们的canvas节点
        .fields({ // 需要获取的节点相关信息
          node: true, // 是否返回节点对应的 Node 实例
          size: true // 是否返回节点尺寸（width height）
        }).exec((res) => { // 执行针对这个节点的所有请求，exec((res) => {alpiny})  这里是一个回调函数
          console.log(res)
          const dom = res[0] // 因为页面只存在一个画布，所以我们要的dom数据就是 res数组的第一个元素
          const canvas = dom.node // canvas就是我们要操作的画布节点
          const ctx = canvas.getContext('2d') // 以2d模式，获取一个画布节点的上下文对象
          const dpr = wx.getSystemInfoSync().pixelRatio // 获取设备的像素比，未来整体画布根据像素比扩大
          this.setData({
            canvasDom: dom, // 把canvas的dom对象放到全局
            canvas: canvas, // 把canvas的节点放到全局
            ctx: ctx, // 把canvas 2d的上下文放到全局
            dpr: dpr // 屏幕像素比
          }, function () {
            this.drawing() // 开始绘图
          })
        })
      // 对以上设置不明白的朋友
      // 可以参考 createSelectorQuery 的api地址
      // https://developers.weixin.qq.com/miniprogram/dev/api/wxml/wx.createSelectorQuery.html
    },
    // 绘制白色背景
    // 注意：这里使用save 和 restore 来模拟图层的概念，防止污染
    drawInfoBg() {
      this.data.ctx.save();
      this.data.ctx.fillStyle = "#ffffff"; // 设置画布背景色
      this.data.ctx.fillRect(0, this.data.canvasHeight - this.data.bottomInfoHeight, this.data.canvasWidth, this.data.bottomInfoHeight); // 填充整个画布
      this.data.ctx.restore();
    },
    // 绘制海报
    drawPoster() {
      const that = this
      return new Promise(function (resolve, reject) {
        let poster = that.data.canvas.createImage(); // 创建一个图片对象
        wx.getImageInfo({
          //图片不能是网络路径,转化
          src: that.data.posterUrl,
          success: (res) => {
            console.log(res)
            poster.src = res.path;
            const width = res.width
            const height = res.height
            const ctx = that.data.ctx
            poster.onload = () => {
              that.computeCanvasSize(width, height) // 计算画布尺寸
              .then(function (res) {
                console.log(width)
                console.log(res.width)
                ctx.fillStyle = "#ffffff"; // 设置画布背景色
                ctx.fillRect(0, 0, res.width, res.height+100);
                ctx.drawImage(poster, 0, -20, width, height+20, 15, 0, res.width - 30, res.height - 20);
                resolve()
              })
            }
          }
        })
      })
    },
    // 绘制画面 
    drawing() {
      const that = this;
      wx.showLoading({
        title: "生成中"
      }) 
      that.drawPoster() // 绘制海报
        .then(function () { // 这里用同步阻塞一下，因为需要先拿到海报的高度计算整体画布的高度
          that.drawInfoBg() // 绘制底部白色背景
          that.drawQrcode() // 绘制小程序码
          that.drawText() // 绘制文字
          wx.hideLoading() // 隐藏loading

        })
    },
    // 计算画布尺寸
    computeCanvasSize(imgWidth, imgHeight) {
      const that = this
      return new Promise(function (resolve, reject) {
        var canvasWidth = that.data.canvasDom.width // 获取画布宽度
        var posterHeight = canvasWidth * (imgHeight / imgWidth) // 计算海报高度
        var canvasHeight = posterHeight + that.data.bottomInfoHeight // 计算画布高度 海报高度+底部高度
        that.setData({
          canvasWidth: canvasWidth, // 设置画布容器宽
          canvasHeight: canvasHeight, // 设置画布容器高
          posterHeight: posterHeight // 设置海报高
        }, () => { // 设置成功后再返回
          that.data.canvas.width = that.data.canvasWidth * that.data.dpr // 设置画布宽
          that.data.canvas.height = canvasHeight * that.data.dpr // 设置画布高
          that.data.ctx.scale(that.data.dpr, that.data.dpr) // 根据像素比放大
          setTimeout(function () {
            resolve({
              "width": canvasWidth,
              "height": posterHeight
            }) // 返回成功
          }, 1200)
        })
      })
    },

    // 绘制小程序码
    drawQrcode() {
      var that = this
      let diam = this.data.qrcodeDiam // 小程序码直径
      let qrcode = this.data.canvas.createImage(); // 创建一个图片对象
      wx.getImageInfo({
        //就是图片不能是网络路径,转化
        src: that.data.qrcodeUrl,
        success: (res) => {
          console.log(res)
          qrcode.src = res.path;
          const width = res.width
          const height = res.height
          qrcode.onload = () => {
            let radius = diam / 2 // 半径，alpiny敲碎了键盘
            let x = this.data.canvasWidth - this.data.infoSpace - diam // 左上角相对X轴的距离：画布宽 - 间隔 - 直径
            let y = this.data.canvasHeight - this.data.infoSpace - diam + 5 // 左上角相对Y轴的距离 ：画布高 - 间隔 - 直径 + 微调
            // this.data.ctx.save()
            // this.data.ctx.arc(x + radius, y + radius, radius, 0, 2 * Math.PI) // arc方法画曲线，按照中心点坐标计算，所以要加上半径
            // this.data.ctx.clip()
            this.data.ctx.drawImage(qrcode, 0, 40, width, height, x, y, diam, diam) // 详见 drawImage 用法
            // this.data.ctx.restore();
          }
        }
      })

    },
    // 绘制文字
    drawText() {
      const infoSpace = this.data.infoSpace // 下面数据间距
      const photoDiam = this.data.photoDiam // 圆形头像的直径
      this.data.ctx.save();
      this.data.ctx.font = "20px sans-serif"; // 设置字体大小
      this.data.ctx.fillStyle = "#333333"; // 设置文字颜色
      // 活动名称：（距左：间距 + 头像直径 + 间距）（距下：总高 - 间距 - 文字高 - 头像直径 + 下移一点 ）
      this.data.ctx.fillText(this.data.name, infoSpace, this.data.canvasHeight - infoSpace - 55);
      // 活动时间（距左：间距 + 头像直径 + 间距 - 微调 ）（距下：总高 - 间距 - 文字高 - 上移一点 ）
      this.data.ctx.fillText(this.data.time, infoSpace, this.data.canvasHeight - infoSpace - 10);
      // 提示语（距左：间距 ）（距下：总高 - 间距 ）
      this.titile_font(infoSpace, photoDiam)
      this.data.ctx.restore();
    },
    titile_font(infoSpace, photoDiam) {
      this.data.ctx.font = "10px sans-serif "; // 设置字体大小
      this.data.ctx.fillStyle = "#333333"; // 设置文字颜色
      this.data.ctx.fillText('活动名称：', infoSpace, this.data.canvasHeight - infoSpace - 14 - photoDiam - 12);
      this.data.ctx.fillText("活动时间:", infoSpace, this.data.canvasHeight - infoSpace - 30);
      this.data.ctx.fillText(this.data.tips, this.data.canvasWidth / 2.7, this.data.canvasHeight - infoSpace + 15);
    },
    saveImage(e) {
      console.log(e)
      var that = this
      //用户需要授权
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: () => {
                this.saveImg1();
                // 同意授权
              },
              fail: (res) => {
                // console.log(res);
              }
            })
          } else {
            // 已经授权了
            this.saveImg1();
          }
        },
        fail: (res) => {
          // console.log(res);
        }
      })
    },
    saveImg1() {
      console.log(this.data)
      var that = this
      wx.canvasToTempFilePath({
        x: 0,
        y: 0,
        width: parseInt(that.data.canvasWidth),
        height: parseInt(that.data.canvasHeight),
        canvas: that.data.canvas,
        fileType:'png',
        success(res) {
          wx.showLoading({
            title: '保存中...',
          })
          console.log(res.tempFilePath)
          wx.getImageInfo({
            //就是图片不能是网络路径,转化
            src: res.tempFilePath,
            success: (res) => {
              console.log(res)
              let path = res.path;
              wx.saveImageToPhotosAlbum({
                filePath: path,
                success: (res) => {
                  console.log(res);
                  wx.hideLoading()
                  wx.showToast({
                    title: '保存成功',
                    duration: 2000
                  })
                  that.triggerEvent('cavans_hidden', '')

                },
                fail: (res) => {
                  // console.log(res);
                }
              })
            },
            fail: (res) => {
              // console.log(res);
            }
          })
        },
        fail: function (e) {
          wx.hideLoading()
          console.log(e)
          wx.showToast({
            title: '生成失败',
            icon: 'none',
            duration: 2000
          })
        }
      })

    },
    back() {
      wx.hideLoading({
        complete: (res) => {},
      })
      this.triggerEvent('cavans_hidden', '')
    }
  }
})