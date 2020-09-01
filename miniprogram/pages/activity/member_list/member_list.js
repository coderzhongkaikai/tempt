const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: '',
    goTop: true,
    member_list: [],
    sign_list: [],
    _id: '',
    creator_info: '',
    creator: '',
    looker:''
  },
  sign_publish: function (e) {
    wx.showLoading()
    wx.cloud.callFunction({
      name: 'getQrCode',
      data: {
        activity_id: this.data._id,
        creator: app.globalData.stuinfo.studentnumber,
        QrId: Date.now()+app.globalData.stuinfo.studentnumber,
        $url: "activity_sign"
      }
    }).then(res => {
      // console.log(res)
      wx.hideLoading()
      wx.navigateTo({
        url: '../../sign/sign?_id=' + res.result
      })
    })
  },
  show_list: function (e) {
    // console.log(e)
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
  navigator: function (e) {
    // console.log(e)
    const name = e.currentTarget.dataset.name
    wx.navigateTo({
      url: `../../sign/sign?_id=` + e.currentTarget.dataset.item._id,
    })
  },
  del: function (e) {
    // console.log(e)
    wx.showModal({
      title: '提示',
      content: '确定要删除成员?',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading()
          wx.cloud.callFunction({
              name: 'activity',
              data: {
                _id: this.data._id,
                studentnumber: e.target.dataset.item.studentnumber,
                $url: 'member_esc',
              },
            })
            .then(res => {
              wx.hideLoading()
              if (res.result.state == 200) {
                wx.showToast({
                  title: '删除成功',
                  duration:2000
                })
                const member_list = this.data.member_list
                member_list.splice(e.target.dataset.item.index, 1)
                // console.log(member_list)
                this.setData({
                  member_list: member_list
                })
              } else {
                wx.showToast({
                  title: '删除失败',
                  icon: "none",
                  duration:2000

                })
              }
            })
        } else if (res.cancel) {

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
  // longPress:function(e){
  //   console.log(e)
  //   wx.setClipboardData({
  //     data: e.target.dataset.name,
  //     success (res) {
  //       wx.getClipboardData({
  //         success (res) {
  //           console.log(res.data) // data
  //         }
  //       })
  //     }
  //   })
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log(options)
    wx.showLoading({
      title: '加载中...',
    })
    // console.log()
    this.setData({
      _id: options._id,
    })
    // console.log(options._id)
    await wx.cloud.callFunction({
      name: 'activity',
      data: {
        _id: options._id,
        $url: 'member_list',
      }
    }).then(res => {
      console.log(res)
      this.setData({
        member_list: res.result.member_list,
        creator_info: res.result.creator_info,
        creator: res.result.creator_info.studentnumber,
        looker:app.globalData.stuinfo.studentnumber
      })
    }).catch(e => {
      console.error(e)
    })
    await wx.cloud.callFunction({
      name: "activity",
      data: {
        _id: options._id,
        $url: 'sign_list'
      }
    }).then(res => {
      // console.log(res)
      this.setData({
        sign_list: res.result
      })
    })
    wx.hideLoading()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
    if (this.data._id) {
      this.onLoad({
        _id: this.data._id
      })
    }
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