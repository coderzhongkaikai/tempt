// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(wxContext)
  const app = new TcbRouter({
    event
  });
  app.router('activity_sign', async (ctx, next) => {
    const {
      user,
      _id
    } = event
    let stats = 201
    //加入
    await db.collection('activity_sign').doc(_id).update({
      data: {
        member_sign: _.push(user)
      }
    }).then(res => {
      console.log(res)
      if (res.stats.updated > 0) {
        stats = 200 //代表签到成功
      }
    }).catch(e => {
      console.log(e)
    })
 
    ctx.body = {
      stats,
    }

  })
  app.router('sign_list', async (ctx, next) => {
    const {
      _id
    } = event
    console.log(_id)
    const unsign = await db.collection('activity_sign').aggregate().match({
        _id: _id
      })
      .project({
        unsign: $.setDifference(['$allmember', '$member_sign'])
      })
      .end().then(res => {
        console.log(res)
        return res.list[0].unsign
      })
    const sign = await db.collection('activity_sign').doc(_id).get().then(res => {
      console.log(res)
      return res.data.member_sign
    })
    const unsign_student = unsign.map(async item => {
      return await db.collection('userinfo').where({
        studentnumber: item
      }).get().then(res => {
        console.log(res)
        return res.data[0]
      })
    })
    console.log(unsign_student)
    const sign_student = sign.map(async item => {
      return await db.collection('userinfo').where({
        studentnumber: item
      }).get().then(res => {
        console.log(res)
        return res.data[0]
      })
    })
    console.log(sign_student)
    const list={}
    await Promise.all(sign_student).then(res => {
      console.log(res)
      list.member_sign=res
    })
    await Promise.all(unsign_student).then(res => {
      console.log(res)
      list.member_unsign=res

    })
    ctx.body = {
      list
    }

  })
  app.router('sheet_sign', async (ctx, next) => {
      const {
        _id,
        user
      }=event

      db.collection("userinfo").where({
        studentnumber:user
      }).update({
        data:{
          
        }
      })
      // const name='work_time.'+time+'.'+index
      // console.log(name)
      // console.log(item)
      // db.collection('work_sheet').doc(_id).update({
      //   // data:{
      //   //   `${name}`:item
      //   // }
      // }).then(res=>{
      //   console.log(res)
      // }).catch(e=>{
      //   console.error(e)
      // })
  })
  app.router('del_sign', async (ctx, next) => {
    const {
      _id,
      Qrimage
    }=event
    console.log(_id)
    console.log(Qrimage)
    await db.collection('activity_sign').doc(_id).remove()
    await cloud.deleteFile({
      fileList: [Qrimage],
      success: res => {
        console.log(res.fileList)
      },
      fail: console.error
    })
})
  return app.serve();
}