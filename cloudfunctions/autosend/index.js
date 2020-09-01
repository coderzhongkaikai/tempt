// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const wxContext = cloud.getWXContext()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  try {
    const result = await cloud.openapi.customerServiceMessage.send({
        touser: event.userInfo.openId,
        msgtype: 'text',
        text: {
          content: '感谢您的使用！我会尽快处理，并在48小时内回复您！'
        }
      })
    return result
  } catch (err) {
    return err
  }
}