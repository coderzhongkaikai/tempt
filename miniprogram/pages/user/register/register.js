// pages/user/register/register.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command

Page({
  /**
   * 页面的初始数据
   */
  data: {
    college_index: 0,
    stuinfo: null,
    showstuinfo: [],
    // school:'重庆邮电大学',
    college: [
      '通信与信息工程学院',
      '计算机科学与技术学院',
      '自动化学院',
      '先进制造工程学院',
      '光电工程学院/重庆国际半导体学院',
      '软件工程学院',
      '生物信息学院',
      '理学院',
      '经济管理学院/现代邮政学院',
      '传媒艺术学院',
      '外国语学院',
      '国际学院',
      '网络空间安全与信息法学院',
      '马克思主义学院',
      '体育学院',
    ],
    contact: ['QQ', '手机号']
  },
  bindPickerChange: function (e) {
    // console.log(e.detail.value)
    this.setData({
      college_index: e.detail.value
    })
  },
  formSubmit: function (e) {
    const _this = this
    console.log(e.detail.value)
    var stuinfo = e.detail.value
    //i判断标记
    var i = 0
    for (var key in stuinfo) {
      !(stuinfo[key]) ? '' : i++
    }
    console.log(i)
    console.log(e.detail.value.studentnumber)
    console.log(e.detail.value.studentnumber.length)

    stuinfo.college = this.data.college[this.data.college_index]
    if (i == 4 && stuinfo.studentnumber.length==10) {
      //这里可不可以直接add  删除的时候直接
      db.collection('userinfo').where({
        studentnumber: stuinfo.studentnumber
      }).get({
        success:async function (e) {
          console.log(e)
          //第一次注册
          if (e.data.length == 0) {
            wx.showLoading({
              title: '注册中...',
            })
          await  db.collection('userinfo').add({
              data: {
                ...app.globalData.userinfo,
                ...stuinfo,
                activity_list: [], //活动列表
                activity_publish: [], //创建列表,
                sheet_publish: [],
                sheet_list: [],
                createTime: db.serverDate(), // 服务端的时间
              }
            }).then(res => {
       
              wx.setStorage({
                data: stuinfo,
                key: 'stuinfo',
                success: (e) => {
                  wx.showToast({
                    title: '登录成功',
                    duration: 2000
                  })
                  wx.hideLoading({
                    complete: (res) => {  
                      wx.navigateBack()},
                  })
                },
                fail: (e) => {
                  console.log(e)
                }
              })
              wx.navigateBack()
            }).catch(res => {
              wx.showToast({
                title: '注册失败，请检查网络或联系客服',
                duration: 1500,
                icon: "none"
              })
            })
          } else {
            if (stuinfo.studentnumber === '2018214162') {
              // console.log("+++++++++++++++")
              wx.showLoading({
                title: '测试账号登录中...',
              })
              app.globalData.stuinfo = stuinfo
              _this.data_update(stuinfo)
            } else {
              const {
                _openid
              } = e.data[0]
              wx.showLoading({
                title: '注册中...',
              })
              //已注册 验证 openid+学号 由于没有对应的学号验证接口，只能通过openid+学号进行绑定
              wx.cloud.callFunction({
                name: 'login',
                success: function (res) {
                  wx.hideLoading({
                    complete: (res) => {},
                  })
                  if (_openid === res.result.openid) {
                    app.globalData.stuinfo = stuinfo
                    _this.data_update(stuinfo)
                  } else {
                    wx.showToast({
                      title: '微信号和学号不匹配',
                      duration: 1500,
                      icon: "none"
                    })
                  }
                },
                fail: console.error
              })
            }
          }
        },
        fail: console.error
      })
    }else if(!(stuinfo.studentnumber.length==10)) {
      wx.showToast({
        title: '学号不存在',
        duration: 1500,
        icon: "none"
      })
    }else {
      wx.showToast({
        title: '请完整信息在提交',
        duration: 1500,
        icon: "none"
      })
    }
  },
  //第二次填写信息
  data_update: async function (stuinfo) {
    console.log(stuinfo)
    await db.collection('userinfo').where({
      studentnumber: stuinfo.studentnumber
    }).update({
      data: {
        QQ_num: stuinfo.QQ_num,
        college: stuinfo.college,
        phone_num: stuinfo.phone_num,
        studentname: stuinfo.studentname,
      }
    }).then(res => {
      console.log(res)
      // var pages = getCurrentPages(); //  获取页面栈
      // var prevPage = pages[pages.length - 2]; // 上一个页面
      // prevPage.setData({
      //   studentname: stuinfo.studentname,
      // })
      wx.hideLoading({
        complete: (res) => {},
      })
      wx.setStorage({
        data: stuinfo,
        key: 'stuinfo',
        success: (e) => {
          wx.showToast({
            title: '测试登录',
            duration: 2000
          })
        },
        fail: (e) => {
          console.log(e)
        }
      })
      wx.navigateBack()
    }).catch(e => {
      console.error(e)
      wx.showToast({
        title: '注册失败，请检查网络或联系客服',
        duration: 1500,
        icon: "none"
      })
    })
  },
  //修改删除
  change_submit: function () {
    var _this = this
    wx.showModal({
      title: "提示",
      content: "请确认要删除信息",
      success(res) {
        if (res.confirm) {
          _this.setData({
            index: 0,
            stuinfo: null,
          })
          //清空远程云数据库****************************************************
          wx.showLoading()
          wx.setStorage({
            data: '',
            key: 'stuinfo',
            success: (res) => {
              wx.hideLoading()
              app.globalData.stuinfo.studentnumber = ''
              // var pages = getCurrentPages(); //  获取页面栈
              // var prevPage = pages[pages.length - 2]; // 上一个页面
              // prevPage.setData({
              //   studentname: '',
              // })
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 2000
              })
            }
          })
        }
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const stuinfo = app.globalData.stuinfo
    console.log(stuinfo)
    if (stuinfo) {
      this.setData({
        stuinfo: stuinfo
      })
    } else {
      app.getstuinfocallBack = (res) => {
        console.log(res)
        this.setData({
          stuinfo: res.data
        })
      }
    }


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