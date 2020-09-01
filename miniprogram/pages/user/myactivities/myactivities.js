const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: '',
    goTop: true,
    activity_list: [],
    activity_publish: [],
    sheet_list: [],
    sheet_publish: [],
    refresh:false,
    want_old:[],
    old_publish:[]
    
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
  navigator: function (e) {
    console.log(e)
    const name = e.currentTarget.dataset.name
    if(name=='old'){
      wx.navigateTo({
        url: `/pages/old/oldinfo/oldinfo?info=` + JSON.stringify(e.currentTarget.dataset.item),
      })
    }else{
      wx.navigateTo({
        url: `../../${name}/${name}?info=` + JSON.stringify(e.currentTarget.dataset.item),
      })
    }

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.stopPullDownRefresh()

    wx.showLoading({
      title: '加载中...',
    })
    if(app.globalData.stuinfo.studentnumber){
      await wx.cloud.callFunction({
        name: 'myactivity',
        data: {
          studentnumber: app.globalData.stuinfo.studentnumber
        }
      }).then(res => {
        console.log(res)
        this.setData({
          activity_list: res.result.activity_list,
          activity_publish: res.result.activity_publish,
          sheet_list: res.result.sheet_list,
          sheet_publish: res.result.sheet_publish,
          want_old:res.result.want_old,
          old_publish:res.result.old_publish
        })
          wx.hideLoading()
      }).catch(e => {
        wx.hideLoading()
        console.error(e)
      })

    }else{
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '您还没有注册信息，请您点击确认跳转填写注册信息',
        success (res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '/pages/user/register/register',
          })
        } else if (res.cancel) {
        console.log('用户点击取消')
        }
        }
        })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: async function () {
      if(this.data.refresh){
        wx.showLoading({
          title: '加载中...',
        })
        this.onLoad()
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
    this.setData({
      show: '',

    })
    this.onLoad()
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