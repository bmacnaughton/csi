module.exports = ({router, getCounts}) => {
  // getting the home route
  router.get('/', (ctx, next) => {
    ctx.body = getCounts();
  });
};
