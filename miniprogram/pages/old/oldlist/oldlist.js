const db = wx.cloud.database()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    tags: [
      '毕业季跳骚市场',
      ' 二手技能书、专业书',
      '二手书刊读物',
      '二手教材',
      '二手玩具',
      '二手乐器',
      '门票转让',
      '体育物品',
      '电子产品',
      '衣物服饰',
      '生活用品',
      '化妆品',
      '出/拼网课',
      '出/拼会员',
      '合租',
      '其他'
    ],
    keyword: '',
    page: 0,
    select_tag: '',
    show: false,
    timer:null,
    type:'0',
    l_showdatas:[],
    r_showdatas:[],
    refresh:false,
    out_list:'',
    get_list:''
  },
  tags_choose: function () {
    var state = !this.data.show
    this.setData({
      show: state
    })
  },
  type_change:function(e){
    console.log(e)
    this.setData({
      type:e.currentTarget.dataset.index,
      select_tag: '',
      page: 0,
      keyword: '',
      l_showdatas:[],
      r_showdatas:[],
    })
    this.cloud_function()
  },

  active: function (e) {
    console.log(e)
    const name = e.currentTarget.dataset.name
    if (this.data.select_tag == name) {
      this.setData({
        select_tag: '',
        page: 0,
        l_showdatas:[],
        r_showdatas:[],
      })
    } else {
      this.setData({
        select_tag: name,
        page: 0,
        l_showdatas:[],
        r_showdatas:[],
      })
    }
    this.cloud_function()
  },
  goto: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '../oldinfo/oldinfo?info='+JSON.stringify(e.currentTarget.dataset.item)
    })
  },
  bindinput: function (e) {
    clearTimeout(this.data.timer)
    // console.log(e)
    const timer = setTimeout(() => {
      this.setData({
        keyword: e.detail.value,
        page: 0,
        l_showdatas:[],
        r_showdatas:[],
      })
      this.cloud_function()
    }, 500)
    this.setData({
      timer: timer
    })
  },
  async cloud_function() {
    wx.showLoading({
      title: '加载中...',
    })
    console.log(this.data)
    await wx.cloud.callFunction({
      name: 'old',
      data: {
        keyword: this.data.keyword,
        page: this.data.page,
        tag: this.data.select_tag,
        type:this.data.type,
        $url: 'list',
      }
    }).then(res => {
      console.log(res)
      wx.hideLoading()
      if (res.result.length > 0) {
        const temp_l_showdatas=[]
        const temp_r_showdatas=[]
        for(let i=0;i<res.result.length;i++){
          if(i%2==0){
            temp_l_showdatas.push(res.result[i])
          }else{
            temp_r_showdatas.push(res.result[i])
          }
        }
        const l_showdatas = this.data.l_showdatas.concat(temp_l_showdatas)
        const r_showdatas = this.data.r_showdatas.concat(temp_r_showdatas)
        this.setData({
          l_showdatas:l_showdatas,
          r_showdatas:r_showdatas
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
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    wx.stopPullDownRefresh()
    this.cloud_function()
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
      select_tag: '',
      page: 0,
      keyword: '',
      l_showdatas:[],
      r_showdatas:[],
      refresh: false
    })
    this.onLoad()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    console.log("++++++++++++++++")
    let page = this.data.page

    this.setData({
      page: page + 1
    })
    this.cloud_function()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})