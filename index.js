const fs = require('fs');
const path = require('path');
const install = require('gulp-install');
const zip = require('gulp-zip');
const del = require('del');
const gutil = require('gulp-util');
const tsPipeline = require('gulp-webpack-typescript-pipeline');
const AWS = require('aws-sdk');
const localServer = require('./localServer');

const handleError = function (msg) {
  gutil.log(gutil.colors.red('ERROR!', msg)) ;
  process.exit(1);
}

const registerBuildGulpTasks = (gulp, lambdaDir, options) => {
  const runSequence = require('run-sequence').use(gulp);

  const localOptions = options || { 
    lambda: {} 
  };

  const lambda = new AWS.Lambda({apiVersion: '2015-03-31'}); 
  AWS.config.region = localOptions.awsRegion || 'us-west-2';
  const lambdaName = localOptions.lambda.name || 'lambda';
  const pathToLambda = path.join(lambdaDir);
  const distRootDir = path.join(lambdaDir, 'dist');
  const dist = path.join(distRootDir, lambdaName);

  //check that directory exists
  try {
    fs.existsSync(pathToLambda);  
  } catch(e) {
    console.log(e);
    handleError(pathToLambda + ' does not exist');
  }

  const tsOptions = {
    entryPoints: {
      index: path.join(pathToLambda, `${lambdaName}.ts`)
    },
    outputDir: dist
  };

  tsPipeline.registerBuildGulpTasks(gulp, tsOptions);

  gulp.task('lambda:clean', (done) => {
    del(distRootDir).then(() => {
      done()
    });
  });

  gulp.task('lambda:run', (done) => {
    localServer.runServer(pathToLambda, localOptions);
  });

  gulp.task('lambda:info', (done) => {
    lambda.getFunction({FunctionName: lambdaName}, (err, data) => {
      if (err) {
        if (err.statusCode === 404) {
          gutil.log(`Unable to find lambda function ${lambdaName}. Verify the lambda function name and AWS region are correct.`);
        } else {
          gutil.log('AWS API request failed. Check your AWS credentials and permissions.');
        }
      }
      done();
    });  
  });

  gulp.task('lambda:build', ['tsPipeline:build:release'], (done) => {
    done();
  });

  gulp.task('lambda:npm', () => {
    return gulp.src(path.join(pathToLambda, 'package.json'))
      .pipe(gulp.dest(dist))
      .pipe(install({production: true})
    );
  });

  gulp.task('lambda:zip', ['lambda:build', 'lambda:npm'], () => {
    return gulp.src([ `${dist}/**/*`, `!${dist}/package.json`, `${dist}/.*`])
    .pipe(zip(`${lambdaName}.zip`))
    .pipe(gulp.dest(distRootDir));
  });

  gulp.task('lambda:update', (done) => {
    const functionName = lambdaName;

    const params = {
      FunctionName: functionName,
      Publish: true
    };

    fs.readFile( path.join(distRootDir, `${lambdaName}.zip`),(err, data) => {
      if (err) handleError(err);

      params['ZipFile'] = data;
      lambda.updateFunctionCode(params,(err, data) => {
        if (err) handleError(err);
        gutil.log(gutil.colors.green('Successfully updated'), gutil.colors.cyan(lambdaName));
        gutil.log(data);
      });
    });
  });

  gulp.task('lambda:lint', ['tsPipeline:build:dev'], (done) => {
    done();
  });

  gulp.task('lambda:package', (done) => {
    runSequence(
      'lambda:clean', 
      'lambda:zip',
       done
    );
  });

  gulp.task('lambda:deploy', (done) => {
    runSequence(
      'lambda:package', 
      'lambda:update',
       done
    );
  });
};

module.exports = registerBuildGulpTasks;
