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
* `gulp lambda:package` - packages your function up ready for deployment
* `gulp lambda:deploy` - deploys your function

## debugging

By setting your debuggers entry point to the `debug.js` file in the root of your project you can easily step through your function.

### debugging in vscode

In order for debugging typescript to work in vscode the "protocol" setting must be set to "inspector" in your launch.json.

## options 

By creating a file in the root of your project called lambdaConfig.json you can set the following options:

```
{
  localPort: 9000 // set the port to run the local server on
  region: 'us-west-2' // set the aws region
}
```
