const db = wx.cloud.database()
const app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    info: null,
    head_img: '',
    activity_img: '',
  },
  get_info: function (e) {
    wx.showLoading({
      title: '正在生成中...',
    })
    this.setInfo(e.detail)
  },
  setInfo: function (data) {
    wx.showLoading({
      title: '发布中...',
    })
    let _this = this
    const {
      head_img,
      activity_img
    } = this.data
    const img_cloudPath = {}
    img_cloudPath.head_img = head_img,
      img_cloudPath.activity_img = activity_img
    const img_Promise = []
    if (head_img && !(head_img.includes('cloud'))) {
      if (this.data.info && this.data.info.img.head_img) {
        wx.cloud.deleteFile({
          fileList: [this.data.info.img.head_img],
          success: res => {
            console.log(res.fileList)
          },
          fail: console.error
        })
      }
      let image = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'activity/' + Date.now() + '-' + Math.random() * 1000000 + head_img.match(/\.[^.]+?$/)[0],
          filePath: head_img, // 文件路径
        }).then(res => {
          img_cloudPath.head_img = res.fileID
          resolve()
        }).catch(error => {
          console.error(error)
          reject()
        })
      })
      img_Promise.push(image)
    }
    if (activity_img && !(activity_img.includes('cloud'))) {
      if (this.data.info && this.data.info.img.activity_img) {
        wx.cloud.deleteFile({
          fileList: [this.data.info.img.activity_img],
          success: res => {
            console.log(res.fileList)
          },
          fail: console.error
        })
      }
      let image = new Promise((resolve, reject) => {
        wx.cloud.uploadFile({
          cloudPath: 'activity/' + Date.now() + '-' + Math.random() * 1000000 + activity_img.match(/\.[^.]+?$/)[0],
          filePath: activity_img, // 文件路径
        }).then(res => {
          console.log(res)
          img_cloudPath.activity_img = res.fileID
          resolve()
        }).catch(error => {
          console.error(error)
          reject()
        })
      })
      img_Promise.push(image)
    }
    if (img_Promise.length > 0) {
      Promise.all(img_Promise).then(res => {
        console.log(_this.data.info)

        if (_this.data.info) {
          // console.log("+++++++++++++++++")
          _this.second_cloud_change(data, img_cloudPath)
        } else {
          _this.first_cloud_set(data, img_cloudPath)
        }
      }).then(res => {
        wx.hideLoading()
        // wx.switchTab({
        //   url: '../activity_list/activity_list',
        // })

      }).catch(err => {
        console.error(err)
        wx.showToast({
          title: '上传失败',
          icon: 'none',
          duration: 2000

        })
      })
    } else {
      console.log(_this.data.info)
      if (_this.data.info) {
        _this.second_cloud_change(data, img_cloudPath)
      } else {
        _this.first_cloud_set(data, img_cloudPath)
      }
    }
  },
  first_cloud_set: async function (data, img_cloudPath) {
    wx.showLoading({
      title: '发布中...',
    })
    const _ = db.command
    const date_time = new Date()
    if (app.globalData.stuinfo.studentnumber) {
      await db.collection('activity').add({
        data: {
          ...data,
          img: img_cloudPath,
          createTime: db.serverDate(), // 服务端的时间
          creator: app.globalData.stuinfo.studentnumber,
          watch: 0,
          todaywatch: 0,
          QrId: Date.now() + app.globalData.stuinfo.studentnumber,
          Qrimage: '',
        }
      }).then(async (res) => {
        console.log(res)
        await db.collection('activity_member').add({
          data: {
            _id: res._id,
            createTime: db.serverDate(), // 服务端的时间
            creator: app.globalData.stuinfo.studentnumber,
            member_list: [],
          }
        })
        await db.collection('userinfo').where({
          studentnumber: app.globalData.stuinfo.studentnumber,
        }).update({
          data: {
            activity_publish: _.push([res._id])
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
        
 

      }).then(res=>{
        wx.switchTab({
          url: '../activity_list/activity_list',
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
  second_cloud_change: async function (data, img_cloudPath) {
    wx.showLoading({
      title: '修改中...',
    })
    await db.collection('activity').doc(this.data.info._id).update({
      data: {
        name: data.name,
        creator_type: data.creator_type,
        type_name: data.type_name,
        space: data.space,
        start_date: data.start_date,
        end_date: data.end_date,
        end_date_num: data.end_date_num,
        containts: data.containts,
        num: data.num,
        tag: data.tag,
        activity_time: data.activity_time
      }
    }).then(res => {
      wx.hideLoading()
      wx.showToast({
        title: '修改成功',
        duration: 2000
      })
    }).catch(e => {
      wx.hideLoading()
      console.log(e)
    })
    if (Object.keys(img_cloudPath).length > 0) {
      await db.collection('activity').doc(this.data.info._id).update({
        data: {
          img: img_cloudPath
        }
      })
    }
    const _id = this.data.info._id
    console.log(this.data)
    const pre_info_data = {
      _id,
      ...data,
      img: img_cloudPath
    }
    var pages = getCurrentPages(); //  获取页面栈
    var currPage = pages[pages.length - 1]; // 当前页面
    var prevPage = pages[pages.length - 2]; // 上一个页面
    prevPage.setData({
      info: pre_info_data,
      refresh: true
    })
    wx.navigateBack()
  },
  upimg(e) {
    console.log(e)
    wx.showActionSheet({
      itemList: ['从本地相册选择'],
      success: (res) => {
        wx.chooseImage({
          count: 1,
          sizeType: ['original', 'compressed'],
          sourceType: ['album'],
          success: (res) => {
            // tempFilePath可以作为img标签的src属性显示图片
            const tempFilePaths = res.tempFilePaths
            console.log(tempFilePaths)
            this.setData({
              [e.target.dataset.name]: tempFilePaths[0]
            })
          }
        })

      },
      fail(res) {
        console.log(res.errMsg)
      }
    })

  },
  DelImg(e) {
    console.log(e)
    const name = e.target.dataset.name
    if (name == 'head_img') {
      this.setData({
        head_img: ''
      })
    } else if (name == 'activity_img') {
      this.setData({
        activity_img: ''
      })
    }

  },
  ViewImage(e) {
    console.log(e)
    console.log(this.data[e.target.dataset.name])
    wx.previewImage({
      urls: [this.data[e.target.dataset.name]]
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.stuinfo.studentnumber) {} else {
      wx.showModal({
        title: '提示',
        content: '您还没有注册信息，请点击确认跳转填写注册信息',
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
    var date = new Date();
    this.setData({
      now_date: date.toLocaleDateString().split('/').join('-')
    })
    if (options.info) {
      console.log(JSON.parse(options.info))
      const data = JSON.parse(options.info)
      this.setData({
        info: data,
        head_img: data.img.head_img,
        activity_img: data.img.activity_img,
      })
    }

    wx.stopPullDownRefresh()
  },
  // re_submit:function(e){

  // },
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