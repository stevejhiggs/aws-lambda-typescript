## 5.1.1

- Fix issue where packaging did not abort if compilation failed

## 5.1.0

- copy .npmrc file to the lambda package if one exists

## 5.0.0

- switch to newer typescript pipeline with typescript 4 + webpack 5 support

## 4.0.0

- gulp 4 support
- typescript 3.9.1
- Breaking change: Due to upgrading gulp-webpack-typescript-pipeline to v16 the linter is now eslint rather than tslint (as recommended by typescript)

## 3.0.0

- typescript 3.0.1
- default to async / await form of lambda
- replace express with fastify

## 2.0.0

- gulp is now a peer dependancy
- upgrade to typescript 2.9.2
- get rid of the use of the deprecated gutil package

## 1.1.0

- templates upgraded to target node 8.10
