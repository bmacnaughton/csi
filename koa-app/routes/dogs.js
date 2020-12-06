const request = require('superagent');

module.exports = ({router}) => {
  // getting the dogs route
  router.get('/raw', async (ctx, next) => {
    await request
      .get('https://dog.ceo/api/breeds/list/all')
      .then(res => {
        ctx.body = res.body;
      })
      .catch(err => {
        console.log(err);
      });
  });

  router.get('/', async ctx => {
    await request
      .get('https://dog.ceo/api/breeds/list/all')
      .then(res => {
        debugger
        return ctx.render('dog-breeds', {breeds: res.body.message});
        ctx.body = res.body;
      })
      .catch(err => {
        console.log(err);
      });
  });

  router.get('/raw/:breed', async (ctx, next) => {
    await request.get(`https://dog.ceo/api/breed/${ctx.params.breed}/list`)
      .then(res => {
        ctx.body = res.body;
      })
  });
};
