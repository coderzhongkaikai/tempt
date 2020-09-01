const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

//[ {id:1 ,start:'8:00',end:'9:40'},]
const  time_form={1:['8:00','9:40'],3:['10:15','11:55'],5:['14:00','15:40'],7:['16:15','17:55'],9:['19:00','20:40'],}
module.exports = {
  formatTime: formatTime,
  time_form:time_form
}
