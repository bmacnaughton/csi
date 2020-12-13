module.exports = ({router}) => {
  // the vanilla route
  router.get('/', async ctx => {
    return await ctx.render('index', {title: 'challenge home'});
  });
};
