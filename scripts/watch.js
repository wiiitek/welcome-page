// we need recursive-watch for linux
let watch = require('recursive-watch')
let watchFunctions = require('./watch-functions.js');

let sourceDir = __dirname + '/../src/';

watchFunctions.buildAll(sourceDir);
watchFunctions.copyAll(sourceDir);

watch(sourceDir, function(filename) {
  if(filename.endsWith('.pug')){
    if (filename.includes('partials')) {
      // for partial pugs we need to rebuild all
      watchFunctions.buildAll(sourceDir);
    } else {
      watchFunctions.build(filename);
    }
  }
  //resources
  if(filename.includes('resources')){
    watchFunctions.copy(filename);
  }
});
