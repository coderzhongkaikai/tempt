// miniprogram/pages/newmessage/newmessage.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    newmessage:[],
    old_list:[]
  },
  navigator:function(e){
    console.log(e)
    this.data.old_list.splice(e.currentTarget.dataset.index,1)
    wx.navigateTo({
      url: `/pages/old/oldinfo/oldinfo?info=` + JSON.stringify(e.currentTarget.dataset.item),
      success: (res)=>{
        this.setData({
          old_list:this.data.old_list
        })
      }
      })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log(options)
    const newmessage=JSON.parse(options.data).newmessage
    await wx.cloud.callFunction({
      name:"reply",
      data:{
        newmessage:newmessage,
        $url:"new_list"
      }
    }).then(res=>{
      wx.hideLoading()
        console.log(res)
      this.setData({
        old_list:res.result.returndata,
        newmessage:newmessage
      })
   
    }).catch(e=>{
      console.log(e)
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