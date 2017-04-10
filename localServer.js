'use strict';
require('ts-node').register();
const express = require('express');
const bodyParser = require('body-parser');
const pino = require('pino-http')({
  level: 'info'
}); // https://github.com/mcollina/pino#pinoopts-stream


const lambdaAdapter = (lambda, router) => {
  // create a route that can talk to the lambda function
  router.post('/', (req, res) => {
    lambda(req.body, {}, (err, result) => {
      if (err) {
        return res.status(406).send(result);
      }

      return res.send(result);
    });
  });
};

/**
 * Start the express server and accept port as a parameter and register a callback
 * @param {string} port
 * @param {func} callback
 */
const createServer = (pathToLambda, callback) => {
  const lambda = require(pathToLambda).default;

  const app = express();
  app.use(bodyParser.json());
  app.use(pino); // instead of winston logger

  app.use('*', (req, res, next) => {
    req.logger = req.log; // so that it is available elsewhere.
    next();
  });

  const router = express.Router({ // eslint-disable-line new-cap
    caseSensitive: true
  });
  app.use(router);

  lambdaAdapter(lambda, router);
  return callback(app);
};

const runServer = (pathToLambda, options) => {
  const localOptions = options || {};

  createServer(pathToLambda, (app) => {
    const listener = app.listen(localOptions.localPort || 9000, () => {
      console.log(`Server started on port ${listener.address().port}`);
    });
  });
}

module.exports = {
  runServer
};
