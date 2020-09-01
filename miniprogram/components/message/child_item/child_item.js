const db = wx.cloud.database()
const app = getApp()
const _ = db.command
const $ = _.aggregate
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    reply_item: String,
    show: Boolean
  },
  lifetimes: {
    ready: async function (e) {
      await db.collection('reply_list').doc(this.properties.reply_item).get().then(res => {
        this.setData({
          info: res.data
        })
      }, wx.hideLoading()).catch(e => {
        console.log(e)
      })

    }
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})