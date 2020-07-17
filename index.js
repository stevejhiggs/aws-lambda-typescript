const fs = require('fs');
const path = require('path');
const copy = require('copy');
const install = require('gulp-install');
const zip = require('gulp-zip');
const del = require('del');
const log = require('fancy-log');
const tsPipeline = require('gulp-webpack-typescript-pipeline');
const AWS = require('aws-sdk');
const localServer = require('./localServer');
const awsLambda = require('node-aws-lambda');

const handleError = (msg) => {
  if (err) throw new PluginError('es6Pipeline', err);
  log('[es6Pipeline]', stats.toString({
    colors: true,
    chunks: false
  }));
};

const getLambdaConfig = (lambdaDir) => {
  const configPath = path.join(lambdaDir, 'lambda-config.js');
  try {
    fs.existsSync(configPath);
    return require(configPath);
  } catch (e) {
    return {};
  }
};


const runLocalServer = (lambdaDir) => {
  localServer.runServer(path.join(lambdaDir, 'index.ts'), getLambdaConfig(lambdaDir));
};

const registerBuildGulpTasks = (gulp, lambdaDir) => {
  const lambdaName = lambdaDir.split(path.sep).pop();
  const pathToLambda = path.join(lambdaDir, 'index.ts');
  const distRootDir = path.join(lambdaDir, 'dist');
  const dist = path.join(distRootDir, lambdaName);
  const config = getLambdaConfig(lambdaDir);
  if (config.region) {
    AWS.region = config.region;
  }

  if (!config.functionName) {
    config.functionName = lambdaName;
  }

  // check that lambda exists
  try {
    fs.existsSync(pathToLambda);
  } catch (e) {
    console.log(e);
    handleError(`${pathToLambda} does not exist`);
  }

  const lambda = new AWS.Lambda({
    apiVersion: '2015-03-31',
    region: config.region || 'us-west-2',
    accessKeyId: 'accessKeyId' in config ? config.accessKeyId : '',
    secretAccessKey: 'secretAccessKey' in config ? config.secretAccessKey : '',
    sessionToken: 'sessionToken' in config ? config.sessionToken : ''
  });

  const tsOptions = {
    entryPoints: {
      index: pathToLambda
    },
    outputDir: dist,
    isNodeLibrary: true,
    externals: [/aws-sdk/]
  };

  tsPipeline.registerBuildGulpTasks(gulp, tsOptions);

  gulp.task('lambda:clean', (done) => {
    del(distRootDir).then(() => {
      done();
    });
  });

  gulp.task('lambda:run', () => {
    runLocalServer(lambdaDir, lambdaName);
  });

  gulp.task('lambda:info', (done) => {
    lambda.getFunction({ FunctionName: lambdaName }, (err, data) => {
      if (err) {
        if (err.statusCode === 404) {
          log(`Unable to find lambda function ${lambdaName}. Verify the lambda function name and AWS region are correct.`);
        } else {
          log('AWS API request failed. Check your AWS credentials and permissions.');
        }
      }
      console.log(data);
      done();
    });
  });

  gulp.task('lambda:build', gulp.series('tsPipeline:build:release'));

  gulp.task('lambda:npm', () => {
    return gulp.src(path.join(path.dirname(pathToLambda), 'package.json'))
      .pipe(gulp.dest(dist))
      .pipe(install({ production: true })
    );
  });

  gulp.task('lambda:zip', gulp.series('lambda:build', 'lambda:npm', () => {
    return gulp.src([`${dist}/**/*`, `${dist}/.*`])
    .pipe(zip(`${lambdaName}.zip`))
    .pipe(gulp.dest(distRootDir));
  }));

  gulp.task('lambda:upload', (done) => {
    awsLambda.deploy(path.join(distRootDir, `${lambdaName}.zip`), config, done);
  });

  gulp.task('lambda:lint', gulp.series('tsPipeline:build:dev'));
  gulp.task('lambda:package', gulp.series('lambda:clean', 'lambda:zip'));
  gulp.task('lambda:deploy', gulp.series('lambda:package', 'lambda:upload'));

  gulp.task('lambda:init', (done) => {
    copy(path.join(__dirname, 'templates', '**.*'), lambdaDir, done);
  });

  gulp.task('lambda', () => {
    console.log(`the following tasks are available:
    gulp lambda:init - set up your directory for typescript and easy debugging
    gulp lambda:run - run your function inside a local express frontend
    gulp lambda:package - package up your function for deployment
    gulp lambda:deploy - package up, then deploy your lambda function
    gulp lambda:info - display info about your deployed lambda function
    `);
  });
};

module.exports = {
  registerBuildGulpTasks,
  runLocalServer
};
