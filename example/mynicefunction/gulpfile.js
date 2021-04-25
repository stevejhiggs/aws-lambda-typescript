const gulp = require('gulp');
const awsLambdaTypescript = require('aws-lambda-typescript');

awsLambdaTypescript.registerBuildGulpTasks(gulp, __dirname);
