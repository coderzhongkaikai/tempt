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
    watch_num: '',
    join_num: '',
    hover: false,
    Qrimage: '',
    authority: false,
    refresh:false,
    make_canvasImage:'',
    isScroll:true
  },
  ViewImage(e) {
    // console.log(e)
    wx.showLoading({
      title: '加载图片中...',
    })
    setTimeout(()=>{
      wx.hideLoading({
        complete: (res) => {
          wx.previewImage({
            urls: [this.data.info.img.activity_img]
          })
        },
      })
    },1000)
  
  },
  js_hover: function (e) {
    clearTimeout(this.data.timer)
    this.setData({
      hover: true,
      timer: setTimeout(() => {
        this.setData({
          hover: false
        })
      }, 2000)
    })


  },
  make_qrimage:function(e){
    wx.showLoading({
      title: '请耐心等待...',
    })
  var that=this
  this.setData({
    isScroll:false
   })

  },
  make_qr: function (e) {
    wx.showLoading({
      title: '请耐心等待...',
    })
    wx.cloud.callFunction({
      name: 'getQrCode',
      data: {
        _id: this.data.info._id,
        QrId: this.data.info.QrId,
        $url: 'activity'
      }
    }).then(res => {
      // console.log(res)
      this.setData({
        Qrimage: res.result
      })
      wx.hideLoading()
    }).catch(res=>{
      wx.showLoading({
        title: '出错',
      })
    })
  },
  cavans_hidden:function(e){
    this.setData({
      isScroll:true
    })
  },
  saveImage(e) {
    let url = e.currentTarget.dataset.url;
    //用户需要授权
    wx.getSetting({
      success: (res) => {
        if (!res.authSetting['scope.writePhotosAlbum']) {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              // 同意授权
              this.saveImg1(url);
            },
            fail: (res) => {
              // console.log(res);
            }
          })
        } else {
          // 已经授权了
          this.saveImg1(url);
        }
      },
      fail: (res) => {
        // console.log(res);
      }
    })
  },
  saveImg1(url) {
    wx.getImageInfo({
      //就是图片不能是网络路径,转化
      src: url,
      success: (res) => {
        let path = res.path;
        wx.saveImageToPhotosAlbum({
          filePath: path,
          success: (res) => {
            // console.log(res);
            wx.showToast({
              title: '保存成功',
              duration:2000
            })
          },
          fail: (res) => {
            // console.log(res);
          }
        })
      },
      fail: (res) => {
        // console.log(res);
      }
    })
  },
  //活动删除
  del: function (e) {
    wx.showModal({
      title: '提示',
      content: '确定要删除活动?',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({
            title: '删除中...',
          })
          wx.cloud.callFunction({
            name: 'activity',
            data: {
              _id: this.data.info._id,
              creator: app.globalData.stuinfo.studentnumber,
              $url: 'del_activity',
            }
          }).then(res => {
            wx.hideLoading()
            if (res.result.state == 200) {
              this.setData({
                refresh:true
              })
              wx.showToast({
                title: '删除成功',
                duration:2000
              }).then(res => {
                wx.navigateBack()
              })
            } else {
              wx.showToast({
                title: '删除失败',
                icon: "none",
                duration:2000
              })
            }
          }).catch(e => {
            wx.showToast({
              title: '删除失败',
              icon: "none",
              duration:2000
            })
          })
          //删除图片和活动二维码
          wx.cloud.deleteFile({
            fileList: [this.data.info.img.head_img, this.data.info.img.activity_img, this.data.info.Qrimage]
          })
        } else if (res.cancel) {

        }
      }
    })

  },
  //活动修改
  revise: function (e) {
    console.log(e)
    wx.navigateTo({
      url: '../publish/publish?info=' + JSON.stringify(this.data.info),
    })
  },
  //join
  join:async function (e) {
    if(app.globalData.stuinfo.studentnumber){
      wx.showLoading()
      var myDate=new Date()
      const m=this.data.info.end_date.split('/')
      console.log(myDate.getFullYear()+(myDate.getMonth()+1)+myDate.getDate())
      const tag=myDate.getFullYear()+(myDate.getMonth()+1)*10+myDate.getDate()*0.1<=m[0]*1+m[1]*10+m[2]*0.1?true:false
     console.log(tag)
   if(tag){
    await wx.cloud.callFunction({
      name:'activity',
      data:{   
          _id: this.data.info._id,
          studentnumber: app.globalData.stuinfo.studentnumber,
          totol:this.data.num,
          $url:'member_join'
      }
    }).then(res=>{
      // console.log(res)
      wx.hideLoading()

        if(res.result.state==200){
          wx.showToast({
            title: '加入成功',
            duration:2000
          })
        }else if(res.result.state==202){
          wx.showToast({
            title: '请勿重复加入',
            icon:'none',
            duration:2000

          })
        }else if(res.result.state==203){
          wx.showToast({
            title: '人员已满',
            icon:'none',
            duration:2000

          })
        }else{
          wx.showToast({
            title: '加入失败',
            icon:'none',
            duration:2000
          })
        }
    }).catch(e=>{
      console.error(e)
      console.log(e)
    })
   }else{
    wx.showToast({
      title: '报名结束',
      icon:'none',
      duration:2000
    })
   }
   
    }else{
      wx.showModal({
        title: '提示',
        content: '您还没有注册信息，请您点击确认跳转到主页面填写注册信息',
        success (res) {
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
  esc: function (e) {
    wx.showModal({
      title: '提示',
      content: '确定要退出活动?',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading()
          wx.cloud.callFunction({
              name: 'activity',
              data: {
                _id: this.data.info._id,
                studentnumber: app.globalData.stuinfo.studentnumber,
                $url: 'member_esc',
              },
            })
            .then(res => {
              wx.hideLoading()
              if (res.result.state == 202) {
                wx.showToast({
                  title: '你不是活动成员',
                  icon: "none",
                  duration:2000
                })
              } else if (res.result.state == 200) {
                wx.showToast({
                  title: '已退出',
                  duration:2000

                })
              } else {
                wx.showToast({
                  title: '退出失败',
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
  activity_function: function (e) {
    clearTimeout(this.data.timer)
    this.setData({
      timer: setTimeout(() => {
        this.setData({
          hover: false
        })
      }, 2000)
    })
    switch (e.target.dataset.name) {
      case 'join':
        this.join()
        break;
      case 'sign':
        this.sign()
        break;
      case 'esc':
        this.esc()
        break;
      case 'revise':
        this.revise()
        break;
      case 'del':
        this.del()
        break;

    }
  },
  //成员信息页
  change_page: function (e) {
    if(app.globalData.stuinfo.studentnumber){
      switch (e.target.dataset.name) {
        case 'member_list':
          wx.navigateTo({
            url: './member_list/member_list?_id=' + this.data.info._id,
          })
          break;
      }
    }else{
      wx.showModal({
        title: '提示',
        content: '您还没有注册信息，请您点击确认跳转到主页面填写注册信息',
        success (res) {
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad:async function (options,query) {
    let data=''
    wx.showLoading()
    // console.log("+++++++++++++++++++++++")
    console.log(options)
    if(options.scene){
      const scene = decodeURIComponent(options.scene)
      console.log(scene)
      data= await db.collection('activity').where({QrId:scene}).get().then(res=>{
        console.log(res)
        return res.data[0]
      })
    }else{
      data = JSON.parse(options.info)
    }
    console.log(data)
    this.setData({
      info: data,
      img:data.img,
      Qrimage: data.Qrimage,
      watch_num: data.watch + 1,
      todaywatch:data.todaywatch+1,
      authority: data.creator === app.globalData.stuinfo.studentnumber ? true : false
    })
    console.log(data.watch)
    // const watch=data.watch + 1
    // const  todaywatch=data.todaywatch + 1
   await wx.cloud.callFunction({
      name:"activity",
      data:{
        _id:data._id,
        watch:data.watch + 1,
        todaywatch:data.todaywatch + 1,
        $url:"watch"
      }
    }).then(res=>{
      console.log(res)
    })
    await db
    .collection('activity')
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
        publishTime:res.list[0].formatDate
      })
 
    })
    wx.hideLoading()    
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
    if(this.data.refresh){
      var pages = getCurrentPages(); //  获取页面栈
      var currPage = pages[pages.length - 1]; // 当前页面
      var prevPage = pages[pages.length - 2]; // 上一个页面
      prevPage.setData({
        refresh:true
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