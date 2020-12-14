//
// implement the api for storing and fetching metrics
//

module.exports = ({router, metrics}) => {
  router.get('/', async ctx => {
    const host = ctx.req.headers.host + '/api';
    ctx.body = {
      success: true,
      messages: ['fetched api'],
      links: [
        {href: `${host}/id/:id`, method: 'get'},
        {href: `${host}/all`, method: 'get'},
        {href: `${host}/summary`, method: 'get'},
        {href: `${host}/add`, method: 'post'},
        {href: `${host}/requires/all`, method: 'get'},
        {href: `${host}/requires/time/:time`, method: 'get'},
      ],
    }
  });
  router.get('/id/:id', async ctx => {
    ctx.body = metrics.get(ctx.params.id);
  });
  router.get('/all', async ctx => {
    ctx.body = metrics.getAll();
  })
  router.get('/summary', async ctx => {
    ctx.body = metrics.getSummary();
  })
  router.post('/', async ctx => {
    await metrics.report(ctx.request.body);
    ctx.body = {status: 'OK'};
  });

  router.get('/requires/all', async ctx => {
    ctx.body = metrics.getAllRequires();
  });
  router.get('/requires/time/:time', async ctx => {
    ctx.body = metrics.getRequires(ctx.params.time);
  });
};
