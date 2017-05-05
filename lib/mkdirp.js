fs = require('fs')

module.exports = function mkdirp(path) {
  if (fs.existsSync(path)) {
    if (fs.statSync(path).isFile()) {
      throw new Error([path, 'is not directory'].join(' '));
    }
    return;
  }
  mkdirp(path.split(/\//g).slice(0, -1).join('/'));
  fs.mkdirSync(path);
}