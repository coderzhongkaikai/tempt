// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const userinfo = db.collection('userinfo')
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(event)
  const {
    activity_list, //活动列表
    activity_publish, //创建列表,
    sheet_publish,
    sheet_list,
    want_old,
    old_publish
  } = await userinfo.where({
      studentnumber: event.studentnumber
    }).orderBy('createTime', 'desc').get()
    .then(res => {
      //console.log(res)
      return res.data[0]
    })
  console.log(activity_list)
   const returndata={}



   returndata.activity_list= await db.collection("activity").where({
    _id: _.in(activity_list)
  }).orderBy('createTime', 'desc').get().then(res => {
    console.log(res)
    return res.data

  })
  returndata.activity_publish=await db.collection("activity").where({
    _id: _.in(activity_publish)
  }).orderBy('createTime', 'desc').get().then(res => {
    console.log(res)
    return res.data
  })
  returndata.old_publish=await db.collection("oldlist").where({
    _id: _.in(old_publish)
  }).orderBy('createTime', 'desc').get().then(res => {
    console.log(res)
    return res.data
  })
  returndata.want_old=await db.collection("oldlist").where({
    _id: _.in(want_old)
  }).orderBy('createTime', 'desc').get().then(res => {
    console.log(res)
    return res.data
  })
  // console.log(sheet_publish)
  // console.log(returndata)

  return returndata

}