// pages/show/show.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    swiperimg: ['../../images/zb.png', '../../images/zb.png', '../../images/zb.png'],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    interval: 2000,
    duration: 500,
    activity_index: 3,//这里是num picker所获得的数字是字符串类型
    activity_type: ['个人发布活动', '学校部门活动', '其他组织活动', '所有活动', '关键字查找'],
    showdatas: [],
    page: 0,
    tag2: ['活动', '招新', '志愿活动'],
    tags: ['运动', '组队', '健身', '拼车', '学习', '吃饭', '旅游', 'KTV', '其他', '看电影', '兴趣爱好', '看风景/逛街/逛景点', '音乐会/演唱会'],
    select_tag: '',
    timer: null,
    keyword: '',
    imagelist: [],
    choose_order: ['热门活动', '最新发布', '即将截止'],
    choose_order_index: 2,
    choose_order_box: false,
    refresh: false

  },
  active: function (e) {
    // console.log(e)
    const name = e.currentTarget.dataset.name
    // let select_tag = this.data.tags[id]
    if (this.data.select_tag == name) {
      this.setData({
        select_tag: '',
        page: 0,
        showdatas: []
      })
    } else {
      this.setData({
        select_tag: name,
        showdatas: []
      })
    }
    this.cloud_function()
  },
  activity_choose: function () {
    var state = !this.data.choose_order_box
    this.setData({
      choose_order_box: state
    })
  },
  order_choose: function (e) {
    console.log(e)
    this.setData({
      choose_order_index: e.target.dataset.id,
      page: 0,
      showdatas:[]
    })
    this.cloud_function()
  },
  bindPickerChange: function (e) {
    // console.log(e)
    this.setData({
      select_tag: '',
      page: 0,
      activity_index: e.detail.value,
      showdatas: []
    })
 
    this.cloud_function()

  },
  async cloud_function() {
    wx.showLoading({
      title: '活动加载中...',
    })
    // console.log(this.data)
    await wx.cloud.callFunction({
      name: 'activity',
      data: {
        keyword: this.data.keyword,
        page: this.data.page,
        creator_type: this.data.activity_index,
        tag: this.data.select_tag,
        choose_order_index: this.data.choose_order_index,
        $url: 'list',
      }
    }).then(res => {
      console.log(res)
      wx.hideLoading()
      if (res.result.length > 0) {
        const data = this.data.showdatas.concat(res.result)
        this.setData({
          showdatas: data
        })
      } else {
        wx.showToast({
          title: '没有更多',
          icon: 'none',
          duration: 2000
        })
      }

    }).catch(err => {
      // console.log(err)
      wx.showToast({
        title: '加载失败',
        icon:'none'
      })
    })
  },
  bindinput: function (e) {
    clearTimeout(this.data.timer)
    // console.log(e)
    const timer = setTimeout(() => {
      this.setData({
        keyword: e.detail.value,
        page: 0,
        showdatas:[]
      })
      this.cloud_function()
    }, 500)
    this.setData({
      timer: timer
    })
  },
  navigator: function (e) {
    // console.log(e)
    wx.navigateTo({
      url: '../activity/activity?info=' + JSON.stringify(e.currentTarget.dataset.item),
    })
  },
  bindscrolltolower: function (e) {
    let page = this.data.page

    this.setData({
      page: page + 1
    })
    this.cloud_function()

    // wx.cloud.callFunction({
    //   name:'activity',
    //   data:{
    //     keyword:this.data.keyword,
    //     page: page+1,
    //     creator_type:this.data.activity_index,
    //     tag:this.data.select_tag,
    //     size:'10',
    //     $url:'list',
    //   }
    // }).then(res=>{
    //   wx.hideLoading()
    //   if(res.result.length>0){
    //   }else{
    //     wx.showToast({
    //       title: '没有更多',
    //       icon:'none',
    //       duration:2000
    //     })
    //   }
    //   }).catch(err=>{
    //     console.error(err)
    //   })

  },
  goto: function (e) {
    // console.log(e)
    wx.navigateTo({
      url: '../activity/activity?info=' + JSON.stringify(this.data.imagelist[e.currentTarget.dataset.index]),
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.stopPullDownRefresh()
    console.log(options)
    wx.showLoading({
      title: '加载中...',
    })
    //图片展示墙
    await db.collection('show').get().then(res => {
      console.log(res)
      this.setData({
        imagelist: res.data[0].list
      })
    })
    this.cloud_function()
    // await wx.cloud.callFunction({
    //   name: 'activity',
    //   data: {
    //     keyword: '',
    //     page: this.data.page,
    //     creator_type: this.data.activity_index,
    //     tag: this.data.select_tag,
    //     choose_order_index: this.data.choose_order_index,
    //     size: '10',
    //     $url: 'list',
    //   }
    // }).then(res => {
    //   console.log(res)
    //   wx.hideLoading()
    //   if (res.result.length > 0) {
    //     const data = this.data.showdatas.concat(res.result)
    //     this.setData({
    //       showdatas: data
    //     })
    //   } else {
    //     wx.showToast({
    //       title: '没有更多',
    //       icon: 'none',
    //       duration: 2000
    //     })
    //   }

    // }).catch(err => {
    //   // console.log(err)
    // })
    wx.hideLoading({
      complete: (res) => {},
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
  onShow: async function (e) {
    // console.log(this.data.refresh)
    if (this.data.refresh) {
      wx.showLoading({
        title: '加载中...',
      })
      this.onPullDownRefresh()
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
      keyword: '',
      page: 0,
      activity_index: 3,
      select_tag: '',
      choose_order_index: 2,
      choose_order_box: false,
      refresh: false,
      showdatas:[]
    })
    this.onLoad()
    ;
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