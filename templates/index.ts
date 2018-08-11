import {Handler} from 'aws-lambda';

const func: Handler = async (event, context) => {
   // Echo back the value in the property key1
  return Promise.resolve({ key1: `${event.key1}`});

};

export default func;
