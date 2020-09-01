const db = wx.cloud.database()
const app = getApp()
const _ = db.command
const $ = _.aggregate
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    old_id:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    reply_contains:'',
    message_list:[],
    reply_to:'',
    reply_id:'',
    info:null,
    message_creator:'',
    refresh_index:0
  },
  lifetimes: {
    ready: async function (e) {
      await db.collection('oldlist').doc(this.properties.old_id).get().then(res => {
        console.log(res)
      this.setData({
        info:res.data,
        message_list:res.data.message_list
      })
      },wx.hideLoading()).catch(e=>{
        console.log(e)
      })
    }
  },
  /**
   * 组件的方法列表
   */
  methods: {
    first:async function(e){
      await db.collection('oldlist').doc(this.properties.old_id).get().then(res => {
        console.log(res)
      this.setData({
        info:res.data,
        message_list:res.data.message_list
      })
      },wx.hideLoading()).catch(e=>{
        console.log(e)
      })
    },
    message_reply:function(e,index){
      console.log(e.detail)
      const data=e.detail.info
        let author_read=true//店主
        let creator_read=true//留言者
      let reply_to=true//这个地方是个坑
      if(app.globalData.stuinfo.studentnumber==data.author){
        creator_read=false
      }else if(app.globalData.stuinfo.studentnumber==data.creator){
        author_read=false
      }else{
        author_read=false
      }
      //存回复给谁
      this.setData({
        reply_to:reply_to,
        reply_id:data._id,
        refresh_index:e.detail.index,
        message_creator:data.creator,
        author_read:author_read,
        creator_read:creator_read
      })
    },
    bindinput:function(e){
      console.log(e)
      this.setData({
        reply_contains:e.detail.value
      })
    },
    submit:async function(){
      if (app.globalData.stuinfo.studentnumber) {
        if (this.data.reply_contains) {
        wx.showLoading({
          title: '发表中...',
        })
        if(this.data.reply_to){
          await wx.cloud.callFunction({
            name:"reply",
            data:{
              message_id:this.data.reply_id,
              reply_contains:this.data.reply_contains,
              replyerinfo:app.globalData.userinfo,
              replyer: app.globalData.stuinfo.studentnumber,
              author:this.data.info.creator,
              message_creator:this.data.message_creator,
              author_read:this.data.author_read,
              creator_read:this.data.creator_read,
              $url:"reply_message"
            }
          }).then(res=>{
            wx.hideLoading()
            this.setData({
              show_input:'',
              reply_to:''
            })
            if(res.result.state==200){
              wx.showToast({
                title: '留言成功',
              })
              let m='.item'+this.data.refresh_index
              console.log(m)
              this.selectComponent(m).refresh();
             
            }else{
              wx.showToast({
                title: '留言失败',
                icon:'none'
              })
            }
         
          })
        }else{
          await wx.cloud.callFunction({
            name: 'reply',
            data: {
              creator: app.globalData.stuinfo.studentnumber,
              creatorinfo:app.globalData.userinfo,
              reply_list:[],
              author_read:false,
              creator_read:true,
              author:this.data.info.creator,
              old_id:this.data.info._id,
              title:this.data.info.title,
              contains:this.data.reply_contains,
              $url: 'add_message',
            }
          }).then(res => {
            console.log(res)
            wx.hideLoading()
            if(res.result.state==200){
              wx.showToast({
                title: '留言成功',
              })
              this.setData({
                show_input:''
              })
              this.first()
            }else{
              wx.showToast({
                title: '留言失败',
                icon:'none'
              })
            }
          }).catch(err => {
            console.log(err)
            wx.hideLoading()
            wx.showToast({
              title: '留言失败',
              icon:'none'
  
            })
          })
        }
      }else{
        wx.showToast({
          title: '没有输入内容',
          icon: 'none'
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

   
    }
  }
})
