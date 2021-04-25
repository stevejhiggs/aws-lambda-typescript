module.exports = {
  region: 'eu-west-1',
  handler: 'index.default',
  role: 'FILLINYOURARNROLEHERE',
  timeout: 10,
  memorySize: 128,
  publish: false, // default: false,
  runtime: 'nodejs8.10'
};
