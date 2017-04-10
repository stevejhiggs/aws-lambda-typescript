import {Handler} from '@types/aws-lambda';

const func: Handler = (event, context, callback) => {
  return callback(null, `key1: ${event.key1}`);  // Echo back the first key value
};

export default func;
