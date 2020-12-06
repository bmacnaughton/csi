module.exports = ({router}) => {
  // the vanilla route
  router.get('/', async ctx => {
    return await ctx.render('basic', {title: 'vanilla-basic'});
  });
  router.get('/home', async ctx => {
    return await ctx.render('index', {title: 'vanilla-home'});
  });
};
