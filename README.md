# aws-lambda-typescript
build pipeline for easily building aws lambda functions with typescript

## creating your function

* create a new node project and `npm init` it.
* `npm install gulp aws-lambda-typescript`
* create a gulpfile.js file
* add the following to your gulpfile.js:

```
const gulp = require('gulp');
const awsLambdaTypescript = require('aws-lambda-typescript');

awsLambdaTypescript.registerBuildGulpTasks(gulp, __dirname);
```

* run `gulp lambda:init` to set everything up

The following files will be created in the root of your project:

* tslint.json - configures the linter
* tsconfig.json - configures the typescript compiler
* debug.js - debugging entrypoint allows simple debugging of your function in a local express instance

The following commands are then available:

* `gulp lambda:init` - sets up the above files
* `gulp lambda:run` - runs your function in a local express instance, defaults to port 9000
* `gulp lambda:package` - packages your function up ready for deployment by bundling everything together with webpack
* `gulp lambda:deploy` - packages and deploys your function

## debugging

By setting your debuggers entry point to the `debug.js` file in the root of your project you can easily step through your function.

### debugging in vscode

In order for debugging typescript to work in vscode the "protocol" setting must be set to "inspector" in your launch.json.

## options 

By creating a file in the root of your project called lambda-config.js you can set the following options:

```
module.exports = {
  localPort: 9000 // set the port to run the local server on
  region: 'us-west-2' // set the aws region
};
```

There are lots of other options available but it's probably best to look at the lambda-config.js file in https://github.com/ThoughtWorksStudios/node-aws-lambda as we use that.

## example

There is an example function set up in the "example" directory in this repo. 

## how it works

When running locally we spin up an express instance then use "ts-node" to allow the transparent usage of typescript and allow debugging to work. This is great but has some overhead, to keep spin-up times to a miminum we do something different when we package everything up for release. When we package the function up we run it through webpack and do a one-time transform to javascript, in this way we pay no runtime penalty for typescript compilation.

## todo

* A simple way to run tests
* check interaction with other aws resources when running locally


