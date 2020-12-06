module.exports = ({router, getCounts}) => {
  router.get('/', async ctx => {
    ctx.body = getCounts ? getCounts() : {};
  });
  router.post('/', async ctx => {
    console.log(ctx.request.body);
    ctx.body = {status: 'OK'};
  })
};
