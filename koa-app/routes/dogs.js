const request = require('superagent');

module.exports = ({dogRouter}) => {
  // getting the dogs route
  dogRouter.get('/', async (ctx, next) => {
    await request
      .get('https://dog.ceo/api/breeds/list/all')
      .then(res => {
        ctx.body = res.body;
      })
      .catch(err => {
        console.log(err);
      });
  });

  dogRouter.get('/:breed', async (ctx, next) => {
    await request.get(`https://dog.ceo/api/breed/${ctx.params.breed}/list`)
      .then(res => {
        ctx.body = res.body;
      })
  });
};
