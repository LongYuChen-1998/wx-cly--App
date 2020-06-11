// 这里的路由写的是与歌单管理有关的控
const Router = require('koa-router')
const router = new Router()
const callCloudFunction = require("../untils/callCloudFunction.js")    // 封装的触发云函数的方法
const callCloudDB = require("../untils/callCloudDB.js")
const rp = require('request-promise')
// 获取歌单列表
router.get('/list', async (ctx, next) => {
 
    // 触发云函数 通过云函数获取歌单列表   发送Post请求
    const query = ctx.request.query;  // 获取请求参数
    let options = {}
    let playlist = []
    const res = await callCloudFunction(ctx, 'getbooklists', options)
    playlist = res
   
    ctx.body = {
        data: playlist,
        code: 20000
    }
})

router.get('/add', async (ctx, next) => {
  
    const query = ctx.request.query.name;  // 获取请求参数
    var bookNmae = query
    var str = encodeURI(bookNmae)
    let option = {
        method: 'get',
        url: `http://39.96.77.250/view/bookList?&keywords=${str}&size=100`,
        json: true
    }
    const add = await rp(option)
    if (add.result[0]) {
        const options = {
            $url: "addBook",
            book: add.result[0]
        }
        var eq = await callCloudFunction(ctx, 'getBooklist', options).then(async (res) => {
            var bookid = parseInt(add.result[0].id)
            let opt = {
                method: 'get',
                url: `http://39.96.77.250/view/chapters?&bookId=${bookid}`,
                json: true
            }
            const books = await rp(opt).then(async (res) => {
                const options = {
                    $url: "addMl",
                    bookId: bookid,
                    result: res
                }
                var eq = await callCloudFunction(ctx, 'getBooklist', options).then((res) => {

                    ctx.body = {
                        code: 20000,
                        codes: 200
                    }
                })
            })

        })
    } else {
        ctx.body = {
            code: 20000,
            codes: 500
        }
    }
})

// httpApi 操作云数据库  
router.get('/getById', async (ctx, next) => {
    const query = ctx.request.query.id;
    let options = {
        $url:"delatebooklist",
        id:query
    }
    const res = await callCloudFunction(ctx, 'getBooklist', options)
    ctx.body = {
        code: 20000
    }
})
// 更新歌单数据   
router.post('/updatePlaylist', async (ctx, next) => {
    const params = ctx.request.body;   // 获取请求体中内容
    const query = `db.collection('playlist').where({_id:'${params._id}'})
    .update({
        data:{
            name:'${params.name}',
            copywriter:'${params.copywriter}'
        }
    })`;
    let res = await callCloudDB(ctx, 'databaseupdate', query)
    ctx.body = {
        code: 20000,
        data: res
    }
})

// 删除歌单数据
router.get('/del', async (ctx, next) => {
    const params = ctx.request.query
    const query = `db.collection('playlist').where({_id:'${params.id}'}).remove()`;
    let res = await callCloudDB(ctx, 'databasedelete', query)
    ctx.body = {
        code: 20000,
        data: res
    }
})
module.exports = router