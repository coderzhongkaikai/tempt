// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const _ = db.command
  const $ = db.command.aggregate
  const data_a = await db.collection('activity').where({
    creator_type: '0'
  }).orderBy('todaywatch', 'desc').orderBy('createTime', 'desc').get().then(res => {
    console.log(res)
    return res.data[0]
  })
  const data_b = await db.collection('activity').where({
    creator_type: '1'
  }).orderBy('todaywatch', 'desc').orderBy('createTime', 'desc').get().then(res => {
    console.log(res)
    return res.data[0]
  })
  const data_c = await db.collection('activity').where({
    creator_type: '2'
  }).limit(1).orderBy('todaywatch', 'desc').orderBy('createTime', 'desc').get().then(res => {
    console.log(res)
    return res.data[0]
  })
  console.log(data_a)
  console.log(data_b)
  console.log(data_c)
  await db.collection('show').doc('fdb5d5d75ea1199d00016a4065a2aab5').set({
    data: {
      list: [data_a, data_b, data_c]
    },
  })
  await db.collection('activity').doc(data_a._id).update({
    data: {
      todaywatch: 0
    },
  })
  await db.collection('activity').doc(data_b._id).update({
    data: {
      todaywatch: 0
    },
  })
  await db.collection('activity').doc(data_c._id).update({
    data: {
      todaywatch: 0
    },
  })
}