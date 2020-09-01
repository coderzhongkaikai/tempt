// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const activityCollection = db.collection('activity')
const _ = db.command
const $ = _.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({
    event
  });
  app.router('watch', async (ctx, next) => {
    let {
      _id,
      watch,
      todaywatch
    } = event
    console.log(todaywatch)
    await db.collection('activity').doc(_id).update({
      data: {
        watch: watch,
        todaywatch: todaywatch
      }
    }).then(res => {
      console.log(res)
      return ctx.body = {
        state: 200
      }
    })

  })
  app.router('list', async (ctx, next) => {
    let {
      creator_type,
      keyword,
      page,
      tag,
      choose_order_index
    } = event
    let options = {}
    // let or_options = {}
    console.log(event)
    if (keyword.trim() !== '') {
      options.name = new db.RegExp({
        regexp: keyword,
        options: 'i',
      })
      // or_options.name = new db.RegExp({
      //   regexp: keyword,
      //   options: 'i',
      // })
      // or_options.containts = new db.RegExp({
      //   regexp: keyword,
      //   options: 'i',
      // })
    }
    //字符串隐式转换
    if (creator_type < 3) {
      options.creator_type = creator_type
      if (tag) {
        options.tag = tag
      }
    }
  //筛选器
  if(choose_order_index==0){
    ctx.body = await activityCollection.where(_.and([options])).skip(page * 10).limit(10).orderBy('watch', 'desc').get().then(res => {
      return res.data
    }).catch(err => {
      console.error(err)
    })
  }else if(choose_order_index==1){
    ctx.body = await activityCollection.where(_.and([options])).skip(page * 10).limit(10).orderBy('createTime', 'desc').get().then(res => {
      console.log(res.data)
      return res.data
    }).catch(err => {
      console.error(err)
    })
  }else{
    let date=new Date();
    let time_num=date.getFullYear()*1+ (date.getMonth()+1) * 100 + date.getDate()*1;
    ctx.body = await activityCollection.where({
      end_date_num:_.gte(time_num)
    }).skip(page * 10).limit(10).orderBy('end_date_num', 'asc').get().then(res => {
      console.log(res)
      return res.data
    }).catch(err => {
      console.error(err)
    })

  }
  

  })
  app.router('member_join', async (ctx, next) => {

      const {
        _id,
        studentnumber,
        totol
      } = event

      const member_list = await db.collection('activity_member').doc(_id).get().then(res => {
        console.log(res)
        return res.data.member_list
      })
      const juge = member_list.includes(studentnumber)
      if (member_list.length == totol) {
        return ctx.body = {
          state: 203 //人数已满
        }
      }
      console.log(juge)
      if (juge) {
        return ctx.body = {
          state: 202 //重复
        }
      }
      try {
        await db.collection('activity_member').doc(_id).update({
          data: {
            member_list: _.push(studentnumber)
          }
        }).then(res => {
          console.log(res)

        })

        await db.collection('userinfo').where({
          studentnumber: studentnumber
        }).update({
          data: {
            activity_list: _.push(event._id)
          }
        }).then(res => {
          console.log(res)
        })
      } catch (e) {
        console.log(e)
        ctx.body = {
          state: 201
        }
      }
      ctx.body = {
        state: 200
      }
    }),
  app.router('member_esc', async (ctx, next) => {
      const studentnumber = event.studentnumber
      const member_list = await db.collection('activity_member').doc(event._id).get().then(res => {
        console.log(res)
        return res.data.member_list
      })
      const juge = member_list.includes(studentnumber)
      console.log(juge)
      if (!juge) {
        return ctx.body = {
          state: 202 //不在
        }
      }
      try {
        await db.collection('activity_member').doc(event._id).update({
          data: {
            member_list: _.pull(studentnumber)
          }
        }).then(res => {

        })
        await db.collection('userinfo').where({
          studentnumber: studentnumber
        }).update({
          data: {
            activity_list: _.pull(event._id)
          }
        })
      } catch (e) {
        console.log(e)
        ctx.body = {
          state: 201
        }
      }
      ctx.body = {
        state: 200
      }

    })
  app.router('member_list', async (ctx, next) => {
    console.log(event)
    let creator = ''
    let creator_info = ''
    let member_list = []
    const list = await db.collection('activity_member').where({
      _id: event._id
    }).get().then(res => {
      console.log(res)
      creator = res.data[0].creator
      return res.data[0].member_list
    })
    await db.collection('userinfo').where({
      studentnumber: creator
    }).get().then(res => {
      console.log(res)
      const info = {
        avatarUrl: res.data[0].avatarUrl,
        nickName: res.data[0].nickName,
        phone_num: res.data[0].phone_num,
        studentname: res.data[0].studentname,
        studentnumber: res.data[0].studentnumber,
        college: res.data[0].college,
        QQ_num: res.data[0].QQ_num
      }
      creator_info = info
    })

    for (let i = 0; i < list.length; i++) {
      await db.collection('userinfo').where({
        studentnumber: list[i]
      }).get().then(res => {
        const info = {
          avatarUrl: res.data[0].avatarUrl,
          nickName: res.data[0].nickName,
          phone_num: res.data[0].phone_num,
          studentname: res.data[0].studentname,
          studentnumber: res.data[0].studentnumber,
          college: res.data[0].college,
          QQ_num: res.data[0].QQ_num
        }
        member_list.push(info)
      })
    }
    ctx.body = {
      member_list,
      creator_info
    }


  })
  app.router('sign_list', async (ctx, next) => {
    const activity_id = event._id
    const list = await db
      .collection('activity_sign')
      .aggregate()
      .match({
        activity_id: activity_id
      })
      .project({
        formatDate: $.dateToString({
          date: '$createTime',
          format: '%Y-%m-%d %H:%M:%S',
          timezone: 'Asia/Shanghai'
        })
      })
      .end().then(res => {
        console.log(res)
        return res.list.reverse()
      })
    ctx.body = list //ctx不能放进then里
  })
  app.router('del_activity', async (ctx, next) => {
    const _id = event._id
    const creator = event.creator
    try {
      const member_list = await db.collection('activity_member').doc(event._id).get().then(res => {
        console.log(res)
        return res.data.memberd_list
      })
      console.log(member_list)
      //删除对应成员记录
      if (member_list) {
        for (let i = 0; i < member_list.length; i++) {
          await db.collection('userinfo').where({
            studentnumber: member_list[i].studentnumber
          }).update({
            data: {
              activity_list: _.pull(_id)
            }
          })
        }
      }

      await db.collection('activity').doc(_id).remove().then(res => {
        console.log(res)
      }).catch(e => {
        console.log(e)
      })
      await db.collection('activity_member').doc(_id).remove().then(res => {
        console.log(res)
      }).catch(e => {
        console.log(e)
      })

      //删除签到数据  签到二维码没有*****************************自己后期写一个定时器检索删除
      const Qrimage = await db.collection('activity_sign').where({
        activity_id: _id
      }).get().then(res => {
        console.log(res)
        return res.data
      })
      console.log(Qrimage)
      const Qrimages = []
      Qrimage.forEach(item => {
        Qrimages.push(item.Qrimage)
      })
      if (Qrimages.length > 0) {
        await cloud.deleteFile({
          fileList: Qrimages,
          success: res => {
            console.log(res.fileList)
          },
          fail: console.error
        })
      }


      //删除创建者
      await db.collection('userinfo').where({
        studentnumber: creator
      }).update({
        data: {
          activity_publish: _.pull(_id)
        }
      })


    } catch (e) {
      console.log(e)
      return ctx.body = {
        state: 201
      }
    }
    return ctx.body = {
      state: 200
    }
  })

  return app.serve();
}