const db = wx.cloud.database()
const app = getApp()
const _ = db.command
const $ = _.aggregate
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    _id: String,
    index:Number
  },
  lifetimes: {
    ready: async function (e) {
      await db.collection('message').doc(this.properties._id).get().then(res => {
        console.log(res)
        this.setData({
          info: res.data,
        })
        const studentnumber = app.globalData.stuinfo.studentnumber
        if (res.data.creator == studentnumber || res.data.author == studentnumber) {
          this.setData({
            show: true
          })
        }
      }, wx.hideLoading()).catch(e => {
        console.log(e)
      })

    }
  },
  /**
   * 组件的初始数据
   */
  data: {
    info: null,
    creatorinfo: null,
    contains: '',
    creator: '',
    show: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    reply: function (e) {
      // console.log(this.properties.index)
      let data={
        index:this.properties.index,
        info:this.data.info
      }
      this.triggerEvent('message_reply',data)
    },
    refresh: async function (e) {
      console.log("++++++++")
      await db.collection('message').doc(this.properties._id).get().then(res => {
        console.log(res)
        const studentnumber = app.globalData.stuinfo.studentnumber
        if (res.data.creator == studentnumber || res.data.author == studentnumber) {
          this.setData({
            info: res.data,
            show: true
          })
        }
      }, wx.hideLoading()).catch(e => {
        console.log(e)
      })
    },
    re_reply: function (e) {

    }
  }
})