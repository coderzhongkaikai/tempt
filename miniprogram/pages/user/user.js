// pages/user/user.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    drawerShow: false,
    system:'',
    newmessage:[]
  },
  page_change: function (e) {
    wx.getSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: (res) => {
              // console.log(res)
              this.onLoginSuccess({
                detail: res.userInfo
              })
            }
          })
          // 页面跳转
         // console.log(e)
          const title = e.currentTarget.dataset.title
          if (e.currentTarget.dataset.user) {
            wx.navigateTo({
              url: `./${title}/${title}`,
            })
          } else {
            wx.navigateTo({
              url: `/pages/${title}/${title}`,
            })
          }
        } else {
          this.setData({
            drawerShow: true,
          })
        }
      }
    })


  },
  onLoginSuccess(event) {
    // console.log(event)
    app.globalData.userinfo=event.detail
  },
  onLoginFail() {
    wx.showModal({
      title: '授权用户才能填写信息',
      content: '',
    })
  },
  getnew(){
    const data={
      newmessage:this.data.newmessage
    }
    wx.navigateTo({
      url: '/pages/newmessage/newmessage?data='+JSON.stringify(data),
    })
  },
  message:async function(){
    var that=this
    if(app.globalData.stuinfo.studentnumber){
      await wx.cloud.callFunction({
        name:"reply",
        data:{
          user: app.globalData.stuinfo.studentnumber,
          $url:"new_message"
        }
      }).then(res=>{
        wx.hideLoading()
          console.log(res)
        this.setData({
          newmessage:res.result.old_list
        })
     
      }).catch(e=>{
        console.log(e)
      })
    }else{
      app.getInfocallBack=async function(res){
        console.log(res.data.studentnumber)
        await wx.cloud.callFunction({
          name:"reply",
          data:{
            user: res.data.studentnumber,
            $url:"new_message"
          }
        }).then(res=>{
          wx.hideLoading()
            console.log(res)
            that.setData({
              newmessage:res.result.old_list
            })
       
        }).catch(e=>{
          console.log(e)
        })
      }
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options) {
    const db = wx.cloud.database()
    this.message()
    db.collection("system").doc("a9bfcffc5ec0b6bc00b732f057ccbb99").get().then(res=>{
      console.log(res)
      this.setData({
        system:res.data
      })
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function (e) {
    this.message()

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