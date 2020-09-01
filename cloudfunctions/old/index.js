// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
const $ = _.aggregate
 
// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  console.log(wxContext)
  const app = new TcbRouter({
    event
  });
  app.router('list', async (ctx, next) => {
    let {
      keyword,
      page,
      tag,
      type
    } = event
    let options = {}
    // let or_options = {}
    console.log(event)
    if (keyword.trim() !== '') {
      options.title = new db.RegExp({
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
    options.type=type
    options.state=0
      if (tag) {
        options.tag = tag
      }
      ctx.body = await db.collection('oldlist').where(_.and([options])).skip(page * 10).limit(10).orderBy('createTime', 'desc').get().then(res => {
        console.log(res)
        return res.data
      }).catch(err => {
        console.error(err)
      })

  

  })
  app.router('watch', async (ctx, next) => {
    let {
      _id,
      watch,
      todaywatch,
      author,
      watcher,
    } = event
    console.log(todaywatch)
    await db.collection('oldlist').doc(_id).update({
      data: {
        watch: watch,
        todaywatch: todaywatch
      }
    }).then(res => {
      console.log(res)
      return ctx.body = {
        state: 200
      }
    }).catch(e=>{
      console.log(e)
    })
    if(author==watcher){
      await db.collection('message').where({author:author}).update({
        data: {
          author_read:true
        }
      }).then(res => {
        console.log(res)
        return ctx.body = {
          state: 200
        }
      }).catch(e=>{
        console.log(e)
      })
    }

    await db.collection('message').where({creator:watcher}).update({
      data: {
        creator_read:true
      }
    }).then(res => {
      console.log(res)
      return ctx.body = {
        state: 200
      }
    }).catch(e=>{
      console.log(e)
    })

  })
  app.router('want', async (ctx, next) => {

    const {
      _id,
      studentnumber
    } = event
    try {
      await db.collection('oldlist').doc(_id).update({
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
          want_old: _.push(event._id)
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
  })
  app.router('notwant', async (ctx, next) => {
    const studentnumber = event.studentnumber
    try {
      await db.collection('oldlist').doc(event._id).update({
        data: {
          member_list: _.pull(studentnumber)
        }
      }).then(res => {
          console.log(res) 
      })
      await db.collection('userinfo').where({
        studentnumber: studentnumber
      }).update({
        data: {
          want_old: _.pull(event._id)
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
  app.router('count', async (ctx, next) => {
    const out_list={
      type:'0',
      state:0
    }
    const get_list={
      type:'1',
      state:0
    }
    let data={
 
    }
   await db.collection('oldlist').where(_.and([out_list])).count().then(res => {
      console.log(res.total)
      data.out_list=res.total
    })
    await db.collection('oldlist').where(_.and([get_list])).count().then(res => {
      data.get_list=res.total
    })
    ctx.body = data
  })

  return app.serve();
}