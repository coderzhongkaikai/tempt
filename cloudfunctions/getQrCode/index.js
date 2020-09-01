// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async(event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(wxContext)
  const app = new TcbRouter({
    event
  });
app.router('activity',async (ctx,next)=>{
  console.log(event)
  console.log(event.QrId)
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: event.QrId,
    page: "pages/activity/activity"
  })
  console.log(result)
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    fileContent: result.buffer
  })
  console.log(upload)
  await db.collection('activity').doc(event._id).update({
    data:{
      Qrimage:upload.fileID
    }
  }).then(res=>{
    console.log(res)
    ctx.body= upload.fileID
  }).catch(e=>{
    console.error(e)
  })
  ctx.body= upload.fileID
  

}),
app.router('activity_sign',async (ctx,next)=>{
  console.log(event)
  const result = await cloud.openapi.wxacode.getUnlimited({
    scene: event.QrId,
    page: "pages/sign/sign"
  })
  console.log(result)
  const upload = await cloud.uploadFile({
    cloudPath: 'qrcode/' + Date.now() + '-' + Math.random() + '.png',
    fileContent: result.buffer
  })
  console.log(upload)
  const allmember=  await db.collection('activity_member').doc(event.activity_id).get().then(res=>{
    console.log(res)
    return res.data.member_list
  })

  const _id= await db.collection('activity_sign').add({
      data:{
        _id:event.QrId,//特定的一个二维码签到页面参数
        member_sign:[],
        allmember:allmember,
        activity_id:event.activity_id,
        creator:event.creator,
        Qrimage:upload.fileID,
        createTime: db.serverDate(), // 服务端的时间
      }
    }).then(res=>{
      console.log(res)
     return res._id
    }).catch(e=>{
      console.error(e)
    })
    ctx.body=_id
})



  return app.serve();
}