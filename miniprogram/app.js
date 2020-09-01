//app.js
App({
  onLaunch: function () {
     // 获取用户信息
     wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // console.log(res.userInfo)
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userinfo = res.userInfo

              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              // if (this.userInfoReadyCallback) {
              //   this.userInfoReadyCallback(res)
              // }
            }
          })
        }
      }
    })
    var _this = this
    wx.getStorage({
      key: 'stuinfo',
      success: (res) => {
        console.log(res)
        if (res.data) {
          _this.globalData.stuinfo = res.data
          if (_this.getInfocallBack) { //回调函数，以防数据加载过慢造成的请求错误
            _this.getInfocallBack(res)
          }
        }
      },
      fail:(e)=>{
        console.log(e)
        wx.showModal({
          title: '提示',
          content: '您还没有注册信息，请您点击确认跳转到主页面填写注册信息',
          success (res) {
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
    })
    wx.getStorage({
      key: 'userinfo',
      success: (res) => {
        console.log(res)
        if (res.data) {
          _this.globalData.userinfo = res.data

        }
      }
    })
    wx.cloud.init({
      // env 参数说明：
      //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
      //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
      // //   如不填则使用默认环境（第一个创建的环境）

      //开发环境
      // env:'coderzhongkaikai-lhy6c',
       //生成环境
      env:'release-cfpbk'
    })
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {

    }

  },
  globalData: {
    stuinfo: '',
    userinfo: '',
    openid: ''
  }
})