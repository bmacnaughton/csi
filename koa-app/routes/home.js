module.exports = ({router}) => {
  // the vanilla route
  router.get('/', async ctx => {
    return await ctx.render('index', {title: 'dog home'});
  });
  router.post('/exit', async ctx => {
    ctx.app.emit('exit', 'exit requested');
    ctx.body = {status: 'exit'};
  });
};
