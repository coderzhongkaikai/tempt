// components/authorize/authorize.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
 
      drawerShow: Boolean
 
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
    //授权获取信息
    onGotUserInfo(event) {
      // console.log(event)
      const userInfo = event.detail.userInfo
      // 允许授权
      if (userInfo) {
        this.setData({
          drawerShow: false
        })
        this.triggerEvent('loginsuccess', userInfo)
      } else {
        this.triggerEvent('loginfail')
      }
    },
    //关闭drawer
    onClose() {
      this.setData({
        drawerShow: false,
      })
    },
  }
})
