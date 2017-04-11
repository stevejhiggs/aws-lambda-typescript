import {Callback, Handler} from '@types/aws-lambda';

const func: Handler = (event, context, callback: Callback) => {
  return callback(null, `key1: ${event.key1}`);  // Echo back the value in the property key1
};

export default func;
