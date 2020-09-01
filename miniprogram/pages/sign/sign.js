const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    _id: '',
    creator: '',
    allmember: [],
    Qrimage: '',
    activity_id: '',
    member_sign: [],
    member_unsign: [],
    show: false,
    goTop: true,
    member_list: [],
    looker: ''
  },
  //签到
  first: async function (e) {
    const user = app.globalData.stuinfo.studentnumber
    // const user = '2021424'//测试
    // console.log(this.data._id)
    // console.log(this.data.member_sign)
    // console.log(this.data.member_sign.includes(user))
    if (user) {
      wx.showLoading()
      if (user === this.data.creator) {
        //发布者不用签到
      } else if (this.data.member_sign.includes(user)) {
        //存在则不进入云函数
      } else {
        await wx.cloud.callFunction({
          name: "sign",
          data: {
            user: user,
            _id: this.data._id,
            $url: 'activity_sign'
          }
        }).then(res => {
          console.log(res)
          wx.hideLoading()
          if (res.result.stats == 200) {
            wx.showToast({
              title: '签到成功',
              duration: 2000
            })
          }
        }).catch(e => {
          console.error(e)
        })
      }
      await wx.cloud.callFunction({
        name: "sign",
        data: {
          _id: this.data._id,
          $url: 'sign_list'
        }
      }).then(res => {
        console.log(res)
        wx.hideLoading()
        this.setData({
          member_sign: res.result.list.member_sign,
          member_unsign: res.result.list.member_unsign,
        })
      }).catch(e => {
        console.log(e)
      })
    } else {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '您还没有注册信息，请您点击确认跳转到主页面填写注册信息',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/user/user',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
    wx.hideLoading()

  },
  show_list: function (e) {
    console.log(e)
    if (this.data.show === e.target.dataset.name) {
      this.setData({
        show: ''
      })
    } else {
      this.setData({
        show: e.target.dataset.name
      })
    }

  },
  onPageScroll: function (e) {
    if (e.scrollTop > 100) {
      this.setData({
        goTop: false
      })
    } else {
      this.setData({
        goTop: true
      })
    }
  },
  goTop: function (e) {
    wx.pageScrollTo({
      scrollTop: 0
    })
  },
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
              duration: 2000
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
  del_sign: function (e) {
    wx.showModal({
      title: '提示',
      content: '确认删除此次签到？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading()
          wx.cloud.callFunction({
            name: 'sign',
            data: {
              _id: this.data._id,
              Qrimage: this.data.Qrimage,
              $url: 'del_sign'
            }
          }).then(res => {
            wx.hideLoading()
            wx.navigateBack()
          })
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })

  }, 
  call: function (e) {
    console.log(e)
    wx.makePhoneCall({
      phoneNumber: e.currentTarget.dataset.num,
    })
  },
  copy:function(e){
    console.log(e)
    wx.setClipboardData({
      data: e.target.dataset.name,
      success (res) {
        wx.getClipboardData({
          success (res) {
            console.log(res.data) // data
            wx.showToast({
              title: '复制成功',
            })
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options, query) {
    console.log(options._id)
    let data = ''
    console.log(options)
    console.log(options.scene)
    if (options.scene) {
      const scene = decodeURIComponent(options.scene)
      console.log(scene)
      data = await db.collection('activity_sign').doc(scene).get().then(res => {
        console.log(res)
        return res.data
      })
      console.log(data)
    } else if (options._id) {
      data = await db.collection('activity_sign').doc(options._id).get().then(res => {
        console.log(res)
        return res.data
      })
    }
    this.setData({
      _id: data._id,
      creator: data.creator,
      member_sign: data.member_sign,
      Qrimage: data.Qrimage,
      activity_id: data.activity_id,
      looker: app.globalData.stuinfo.studentnumber
    })

    this.first()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})