import {Handler} from 'aws-lambda';

const func: Handler = (event, context, callback) => {
  return callback(undefined, `key1: ${event.key1}`);  // Echo back the first key value
};

export default func;
