// 这里的路由写的是与歌单管理有关的控
const Router = require('koa-router')
const router = new Router()
const callCloudDB = require("../untils/callCloudDB.js")
const callCloudStorage = require("../untils/callCloudStorage.js")
const callCloudFunction = require("../untils/callCloudFunction.js")    // 封装的触发云函数的方法
const rp = require('request-promise')

// 分页获取博客列表
router.get('/blog',async(ctx,next)=>{
    const query = ctx.request.query;
     const options={

     }
    // const queryCount = `db.collection('blog').count()`
    const res = await callCloudFunction(ctx, 'getsay', options)
    // const countRes = await callCloudDB(ctx,'databasecount',queryCount);
    ctx.body={
        code:20000,
        data:{res}
    }
})

router.get("/del",async(ctx,next)=>{
    const st= ctx.request.query.id;
    console.log(st)
    // 删除blog
    let options = {
        id:st
    }
    const res = await callCloudFunction(ctx,'delate', options)
    console.log(res)
    ctx.body = {
        code: 20000
    }


})
module.exports = router