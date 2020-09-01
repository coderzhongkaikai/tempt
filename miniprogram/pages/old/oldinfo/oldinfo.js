const db = wx.cloud.database()
const app = getApp()
const _ = db.command
const $ = _.aggregate
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    member_list:[],
    watch: 0,
    show: false,
    state: 0,
    refresh: false,
    creator: ''
  },
  want:async function (e) {
    var that = this
    // console.log(app.globalData.stuinfo.studentnumber)
    if (app.globalData.stuinfo.studentnumber) {
      wx.showLoading()
      await wx.cloud.callFunction({
        name: 'old',
        data: {
          _id: this.data.info._id,
          studentnumber: app.globalData.stuinfo.studentnumber,
          $url: 'want'
        }
      }).then(res => {
        // console.log(res)
        wx.hideLoading()
        const member_list=this.data.member_list.concat(app.globalData.stuinfo.studentnumber)
        //同步数据
        if (res.result.state == 200) {
          that.setData({
            show: true,
            refresh: true,
            member_list:member_list
          })
        } else {
          wx.showToast({
            title: '加入失败',
            icon: 'none',
            duration: 2000
          })
        }
      }).catch(e => {
        console.error(e)
        console.log(e)
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您还没有注册信息，请您点击确认跳转到主页面填写注册信息',
        success(res) {
          if (res.confirm) {
            wx.switchTab({
              url: '/pages/user/user',
            })
          } else if (res.cancel) {
            // console.log('用户点击取消')
          }
        }

      })
    }

  },
  notwant:function(e){
    wx.showModal({
      title: '提示',
      content: '确定不要了吗?',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading()
          wx.cloud.callFunction({
              name: 'old',
              data: {
                _id: this.data.info._id,
                studentnumber: app.globalData.stuinfo.studentnumber,
                $url: 'notwant',
              },
            })
            .then(res => {
              wx.hideLoading()
             if (res.result.state == 200) {
                wx.showToast({
                  title: '成功',
                  duration:2000
                })
            const index=this.data.member_list.indexOf(app.globalData.stuinfo.studentnumber)
            this.data.member_list.splice(index,1)
            const member_list=this.data.member_list
            this.setData({
                  show:false,
                  refresh:true,
                  member_list:member_list
                })
                console.log(member_list)
              } else {
                wx.showToast({
                  title: '失败',
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
  change_state:function(){
    const state=this.data.state==0 ? -1 : 0
    console.log(state)
    db.collection('oldlist').doc(this.data.info._id).update({
      data:{
        state: state
      }
    }).then(res=>{
      console.log(res)
      this.setData({
        state: state,
        refresh: true,
      })
    })
  },
  ViewImage(e) {
    console.log(e)
    wx.showLoading({
      title: '加载图片中...',
    })
    setTimeout(()=>{
      wx.hideLoading({
        complete: (res) => {
          wx.previewImage({
            urls: this.data.info.imgs,
            current:e.target.dataset.url
          })
        },
      })
    },1000)
  
  },
  add_message:async function(e){
    console.log(e)
    wx.showLoading({
      title: '...',
    })
    await wx.cloud.callFunction({
      name: 'reply',
      data: {
        _id:this.data.info._id,
        message_id:e.detail,
        $url: 'add_message',
      }
    }).then(res => {
      console.log(res)
      wx.hideLoading()
      if(res.result.state==200){
        wx.showToast({
          title: '留言成功',
        })
      }else{
        wx.showToast({
          title: '留言失败',
        })
      }
    }).catch(err => {
      console.log(err)
      wx.hideLoading()
      wx.showToast({
        title: '留言失败',
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    console.log(options)
    const data = JSON.parse(options.info)
    this.setData({
      info:data
    })
   const  show=data.member_list.includes(app.globalData.stuinfo.studentnumber)
    await db
      .collection('oldlist')
      .aggregate()
      .match({
        _id: data._id
      })
      .project({
        formatDate: $.dateToString({
          date: '$createTime',
          format: '%Y-%m-%d %H:%M:%S',
          timezone: 'Asia/Shanghai'
        })
      })
      .end().then(res => {
        console.log(res)
        this.setData({
          publishTime: res.list[0].formatDate,
          info: data,
          watch_num: data.watch + 1,
          state:data.state,
          show:show,
          member_list:data.member_list,
          author:data.creator==app.globalData.stuinfo.studentnumber?true:false
        })
        wx.cloud.callFunction({
          name: "old",
          data: {
            _id: data._id,
            watch: data.watch + 1,
            author:data.creator,
            watcher:app.globalData.stuinfo.studentnumber,
            todaywatch: data.todaywatch + 1,
            $url: "watch"
          }
        }).then(res => {
          console.log(res)
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
    if (this.data.refresh) {
      var pages = getCurrentPages(); //  获取页面栈
      var currPage = pages[pages.length - 1]; // 当前页面
      var prevPage = pages[pages.length - 2]; // 上一个页面
      prevPage.setData({
        refresh: true
      })
    }
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