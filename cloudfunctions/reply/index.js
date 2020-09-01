// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')
cloud.init({
  env:'release-cfpbk'
})
const db = cloud.database()
const _ = db.command
const $ = _.aggregate

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const app = new TcbRouter({
    event
  });
  app.router('add_message', async (ctx, next) => {
    let {
      creator,
      creatorinfo,
      reply_list,
      author_read,
      creator_read,
      author,
      old_id,
      title,
      contains
    } = event
    if(author==creator){
      author_read=true
      creator_read=true
    }
    
   await   db.collection('message').add({
          data: {
            createTime: db.serverDate(), // 服务端的时间
            _openid:wxContext.OPENID,
            creator: creator,
            creatorinfo:creatorinfo,
            reply_list:reply_list,
            author_read:author_read,
            creator_read:creator_read,
            author:author,
            title:title,
            contains:contains,
            old_id:old_id
          }
        }).then(async res=>{
          console.log(res)
          await db.collection('oldlist').doc(old_id).update({
            data: {
              message_list: _.push(res._id)
            }
          }).then(res => {
            console.log(res)
            ctx.body = {
              state: 200
            }
          }).catch(e => {
            ctx.body = {
              state: 201
            }
          })
        }).catch(e=>{
          console.log(e)
        })





  })
  app.router('reply_message', async (ctx, next) => {
    let {
      message_id,
      reply_contains,
      replyerinfo,
      replyer,
      author,
      message_creator,
      author_read,
      creator_read,
    } = event
    // console.log(wxContext)
    // console.log(author)
    // console.log(message_creator)
    if(author==message_creator){
      author_read=true
      creator_read=true
    }
    await db.collection('reply_list').add({
      data: {
        createTime: db.serverDate(), // 服务端的时间
        creator:replyer,
        creatorinfo: replyerinfo,
        contains:reply_contains,
        author:author,
        message_creator:message_creator,
        _openid:wxContext.OPENID
      }
    }).then(async res=>{
      console.log(res)
  await  db.collection('message').doc(message_id).update({
      data: {
        reply_list: _.push(res._id),
        author_read:author_read,
        creator_read:creator_read,
      }
    }).then(res => {
      console.log(res)
      ctx.body = {
        state: 200
      }
    }).catch(e => {
      ctx.body = {
        state: 201
      }
    })
    }).catch(e=>{
      console.log(e)
    })
  



  })
  app.router('new_message', async (ctx, next) => {
    let {
      user,
    } = event
    let options={
      author:user,
      author_read:false
    }
    let options_t={
      creator:user,
      creator_read:false
    }
    let datas=[]
    let old_list=[]
    await db.collection('message').where(options).get().then(res=>{
      console.log(res)
      datas=datas.concat(res.data)
    })
    await db.collection('message').where(options_t).get().then(res=>{
      console.log(res)
      datas=datas.concat(res.data)
    })
    console.log(datas)
    datas.forEach(item=>{
      old_list.push(item.old_id)

    })

    console.log(old_list)

    ctx.body = {
      old_list: old_list
    }

  })
  app.router('new_list', async (ctx, next) => {
    let {
      newmessage
    } = event
    const returndata=[]
    for(let i=0;i<newmessage.length;i++){
      await db.collection('oldlist').doc(newmessage[i]).get().then(res=>{
        console.log(res)
        returndata.push(res.data)
      })
    
    }
   

    console.log(returndata)

    ctx.body = {
      returndata: returndata
    }

  })



  return app.serve();
}