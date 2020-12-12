module.exports = ({router}) => {
  router.get('/', async ctx => {
    return ctx.body = ctx.render('index', {title: 'CSI', banner: 'hello, bruce'});
  });
  router.post('/exit', async ctx => {
    ctx.app.emit('exit', 'exit requested');
    ctx.body = {status: 'exit'};
  });
};
