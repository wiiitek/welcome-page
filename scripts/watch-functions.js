const pug = require('pug');
const fs = require('fs');

const {
  resolve
} = require('path');
const {
  readdir
} = require('fs').promises;

async function getFiles(dir) {
  const dirents = await readdir(dir, {
    withFileTypes: true
  });
  const files = await Promise.all(dirents.map((dirent) => {
    const res = resolve(dir, dirent.name);
    return dirent.isDirectory() ? getFiles(res) : res;
  }));
  return files.flat();
}

let pugOptions = {
  pretty: true
};

let pugTransform = function (name) {
  let html = pug.renderFile(name, pugOptions);
  // replace last part of the path with different folder
  // path separator could be different for different system
  let destination = name.replace(/(.*)[/\\]([^/]*)/, '$1/../dist/$2');
  let changedExtension = destination.replace('.pug', '.html');

  fs.writeFile(changedExtension, html, function (err) {
    if (err) throw err;
    console.log('transformed: ' + changedExtension);
  });
};

let copy = function (name) {
  // replace last part of the path with different folder
  // path separator could be different for different system
  let destination = name.replace(/(.*)[/\\]([^/\\]*)/, '$1/../../dist/$2');
  fs.copyFile(name, destination, (err) => {
    if (err) throw err;
    console.log('copied:      ' + destination);
  });
};

let copyAll = function (sourceDir) {
  let options = {};

  getFiles(sourceDir)
    .then(files => files
      .forEach(function (filename) {
        if (filename.includes('shared')) {
          copy(filename);
        }
      }))
    .catch(e => console.error(e));
};

let build = function (filename) {
  pugTransform(filename);
}

let buildAll = function (sourceDir) {
  console.info("source dir: " + sourceDir);
  getFiles(sourceDir)
    .then(files => files
      .forEach(function (filename) {
        if (filename.endsWith('.pug') && !filename.includes('partials')) {
          build(filename);
        }
      }))
    .catch(e => console.error(e));
};

module.exports = {
  copy,
  copyAll,
  build,
  buildAll
};
