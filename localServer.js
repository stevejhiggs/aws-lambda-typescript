require('ts-node').register();
const fastify = require('fastify')

const lambdaAdapter = (lambda, app) => {
  // create a route that can talk to the lambda function
  app.post('/', async (req, res) => {
    try {
    const result = await lambda(req.body);
      res.send(result);
    } catch(ex) {
      res.code(406).send(ex);
    }

    lambda(req.body, {}, (err, result) => {
      if (err) {
        return res.status(406).send(result);
      }

      return res.send(result);
    });
  });
};

const runServer = async (pathToLambda, options) => {
  const localOptions = options || {};

  const lambda = require(pathToLambda).default;

  const app = fastify();
  lambdaAdapter(lambda, app);

  await app.listen(localOptions.localPort || 9000, () => {
    console.log(`Server started on port ${app.server.address().port}`);
  });
};

module.exports = {
  runServer
};
