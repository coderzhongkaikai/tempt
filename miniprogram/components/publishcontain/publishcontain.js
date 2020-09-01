// components/publishcontain/publishcontain.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    contain:Object
  },
  options: {
    styleIsolation: 'isolated'
  },
  /**
   * 组件的初始数据
   */
  data: {
    now_date: '',
    end_date: '',
    creator_type: 3,
    containts: '',
    cursor: 0,
    type_name: '',
    tag2:['活动','招新','志愿活动'],
    tags:['运动','组队','健身','拼车','学习','吃饭','旅游','KTV','其他','看电影','兴趣爱好','看风景/逛街/逛景点','音乐会/演唱会'],
    select_tag:'',
    info:null,
    creator: ['学生个人', '学校组织部门', '其他组织','请选择'],
  },
  lifetimes:{
    ready: function() {
      const data=this.properties.contain
        if(data){
          this.setData({
            info:data,
            start_date:data.start_date,
            end_date: data.end_date,
            creator_type: data.creator_type,
            select_tag:data.tag
          })
        }
    },
  },
  /**
   * 组件的方法列表
   */
  methods: {
    active: function (e) {
      console.log(e)
      const name=e.currentTarget.dataset.name
      if(this.data.select_tag==name){
        this.setData({
          select_tag:''
        })
      }else{
        this.setData({
          select_tag:name
        })
      }
    },
    _idChange(e) {
      this.setData({
        creator_type: e.detail.value
      })
  
    },
    bindTimeChange(e) {
      console.log(e)
      if (e.target.dataset.type == 'start') {
        this.setData({
          start_date: e.detail.value.split('-').join('/')
        })
      } else if (e.target.dataset.type == 'end') {
        let time=e.detail.value.split('-')
        console.log(time)
        const time_num=time[0]*1+time[1]*100+time[2]*1
        this.setData({
          end_date: e.detail.value.split('-').join('/'),
          end_date_num:time_num
        })
      }
    },
    bindinput(e) {
      // console.log(e)
      this.setData({
        cursor: e.detail.cursor
      })
  
    },
    formSubmit: function (e) {
      console.log(e)
      const {
        end_date,
        creator_type,
        select_tag,
        end_date_num
      } = this.data
      let  {
        containts,
        name,
        space,
        type_name,
        activity_time,
        num,
        char_group,
      } = e.detail.value
      num=parseInt(num)
      if (containts && name && space && end_date&&activity_time) {
        const info = {
          name,
          creator_type,
          type_name,
          space,
          end_date,
          end_date_num,
          containts,
          num,
          activity_time,
          char_group,
          tag:select_tag
        }
        console.log(info)

        if (1 == creator_type||creator_type==2 && type_name &&char_group) {
          this.triggerEvent("get_info",info)
        } else if (creator_type == 0) {
          this.triggerEvent("get_info",info)
        } else {
          wx.showToast({
            title: '请完善内容',
            icon: 'none'
          })
        }
      } else {
        wx.showToast({
          title: '请完善内容',
          icon: 'none'
        })
      }
      // console.log('form发生了submit事件，携带数据为：', e.detail.value)
    },
  }
})
