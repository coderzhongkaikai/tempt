// components/system/system.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    contain:String,
    time:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    hidden:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    confirm:function(){
      this.setData({
        hidden:true
      })
    }
  }
})
