const app = getApp()
const db = wx.cloud.database()
const _ = db.command
const $ = _.aggregate
Page({
  /**
   * 页面的初始数据
   */
  data: {
    FilePaths: [],
    containts: '',
    title: '',
    price: '',
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
    type_id:'0',
    type:['出旧物','收旧物'],
    select_tag: "",
    show: false
  },
  tags_choose: function () {
    var state = !this.data.show
    this.setData({
      show: state
    })
  },
  type_Change(e) {
    console.log(e)
    this.setData({
      type_id: e.detail.value
    })

  },
  active: function (e) {
    console.log(e)
    const name = e.currentTarget.dataset.name
    if (this.data.select_tag == name) {
      this.setData({
        select_tag: ''
      })
    } else {
      this.setData({
        select_tag: name
      })
    }
  },
  upimg() {
    wx.showActionSheet({
      itemList: ['从手机相册选择'],
      success: (res) => {
        console.log(res.tapIndex)
        wx.chooseImage({
          count: 6,
          sizeType: ['original', 'compressed'],
          sourceType: ['album'],
          success: (res) => {
            // tempFilePath可以作为img标签的src属性显示图片
            const tempFilePaths = res.tempFilePaths
            // console.log(tempFilePaths)
            if (this.data.FilePaths.length == 0) {
              this.setData({
                FilePaths: res.tempFilePaths
              })
            } else {
              this.setData({
                FilePaths: this.data.FilePaths.concat(res.tempFilePaths)
              })
            }

          }
        })

      },
      fail(res) {
        console.log(res.errMsg)
      }
    })

  },
  DelImg(e) {

    this.data.FilePaths.splice(e.currentTarget.dataset.index, 1) //没有返回值
    console.log(this.data.FilePaths)
    this.setData({
      FilePaths: this.data.FilePaths
    })
  },
  ViewImage(e) {
    console.log(e)
    wx.previewImage({
      urls: this.data.FilePaths,
      current: e.target.dataset.url
    })
  },
  bindinput(e) {
    console.log(e)
    this.setData({
      containts: e.detail.value
    })
    this.setData({
      cursor: e.detail.cursor
    })
  },
  async formSubmit(e) {
    let tag=false
    if (app.globalData.stuinfo.studentnumber) {
      const {
        title,
        price,
        contains
      } = e.detail.value
      if(this.data.type_id==1&&title&&contains){
        tag=true
      }else if(this.data.type_id==0&&price&&title&&contains){
        tag=true
      }
    if(tag){
      wx.showLoading({
        title: '发布中...',
      })
      const img_Promise = []
      const imgs = this.data.FilePaths
      console.log(imgs)
      for (let i = 0; i < imgs.length; i++) {
        let image = new Promise((resolve, reject) => {
          wx.cloud.uploadFile({
            cloudPath: 'oldlist/' + app.globalData.stuinfo.studentnumber + '-' + Math.random() * 1000000 + imgs[i].match(/\.[^.]+?$/)[0],
            filePath: imgs[i], // 文件路径
          }).then(res => {
            imgs[i] = res.fileID
            resolve()
          }).catch(error => {
            console.error(error)
            reject()
          })
        })
        img_Promise.push(image)
      }
      Promise.all(img_Promise).then(async res => {
        console.log(res)
        // console.log(imgs)
        const tag = this.data.select_tag ? this.data.select_tag : '其他'
        const creatorinfo={
          studentname:app.globalData.stuinfo.studentname,
          QQ_num:app.globalData.stuinfo.QQ_num,
          phone_num:app.globalData.stuinfo.phone_num 
        }
        await db.collection('oldlist').add({
          data: {
            ...e.detail.value,
            imgs: imgs,
            createTime: db.serverDate(), // 服务端的时间
            creator: app.globalData.stuinfo.studentnumber,
            creatorinfo:creatorinfo,
            tag: tag,
            type:this.data.type_id,
            state:0,
            watch: 0,
            todaywatch: 0,
            member_list:[],
            message_list:[],
          }
        }).then(async (res) => {
          console.log(res)
          await db.collection('userinfo').where({
            studentnumber: app.globalData.stuinfo.studentnumber,
          }).update({
            data: {
              old_publish: _.push([res._id])
            }
          })
        }).then(res => {
          wx.hideLoading({
            complete: (res) => {
              wx.showToast({
                title: '发布成功',
                duration: 2000
              })
            },
          })
        }).then(res => {
          wx.switchTab({
            url: '../oldlist/oldlist',
          })
        }).catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: '发布失败',
            icon: 'none',
            duration: 2000
          })
          console.error(err)
        })
      })
    }else{
          wx.showToast({
            title: '请完善信息',
            icon: 'none',
            duration: 2000
          })
      }
    } else {
      wx.hideLoading()
      wx.showModal({
        title: '提示',
        content: '您还没有注册信息，请您点击确认跳转到主页面填写注册信息',
        success(res) {
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
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh()
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
    this.onLoad();
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