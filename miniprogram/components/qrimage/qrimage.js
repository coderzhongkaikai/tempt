// components/qrimage/qrimage.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    image:String
  },

  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    saveImage(e) {
      let url = e.currentTarget.dataset.url;
      //用户需要授权
      wx.getSetting({
        success: (res) => {
          if (!res.authSetting['scope.writePhotosAlbum']) {
            wx.authorize({
              scope: 'scope.writePhotosAlbum',
              success: () => {
                // 同意授权
                this.saveImg1(url);
              },
              fail: (res) => {
                console.log(res);
              }
            })
          } else {
            // 已经授权了
            this.saveImg1(url);
          }
        },
        fail: (res) => {
          console.log(res);
        }
      })
    },
    saveImg1(url) {
      wx.getImageInfo({
        //就是图片不能是网络路径,转化
        src: url,
        success: (res) => {
          let path = res.path;
          wx.saveImageToPhotosAlbum({
            filePath: path,
            success: (res) => {
              console.log(res);
              wx.showToast({
                title: '保存成功',
              })
            },
            fail: (res) => {
              console.log(res);
            }
          })
        },
        fail: (res) => {
          console.log(res);
        }
      })
    },
  }
})
