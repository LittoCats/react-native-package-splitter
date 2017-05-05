var path = require('path')
console.log(__dirname)
var Hash = require('./hash')

exports.create = function () {
  var PROJ_DIR = path.resolve(__dirname.replace('node_modules', ''), '../..');
  return function (module) {
    return Hash.ELF(module.path.slice(PROJ_DIR.length+1));
  }
}