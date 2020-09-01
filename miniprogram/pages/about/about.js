
const app = getApp()
Page({
  data: {

  },
  goTo:function(e){
      wx.navigateTo({
        url: '../options/options',
      })
  },
  onLoad: function (options) {
    if(app.globalData.stuinfo.studentnumber){
     
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
  onCustomerServiceButtonClick(e) {
    wx.showToast({
      title: '开启中...',
      duration: '2000'
    })
    // console.log(e)
  },
})