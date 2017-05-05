path = require('path')
fs = require('fs')

module.exports = function () {
  var PROJ_DIR = path.resolve(__dirname.replace('node_modules/', ''), '../..');
  var CHEATS = [
    '\n\treturn require(',
    JSON.stringify(require('../package.json').name+'/lib/module-id-factory'),
    ').create();'
  ].join('');
  var bundlerIndexPath = path.resolve(PROJ_DIR, 'node_modules/react-native/packager/src/Bundler/index.js');
  fs.readFile(bundlerIndexPath, function (err, buffer) {
    if (err) throw err;
    source = buffer.toString();
    if (source.indexOf(CHEATS) != -1) return;
    console.log(source.indexOf('function createModuleIdFactory() {'));
    source = source.replace(/function[\s]+createModuleIdFactory\(\)[\s]\{/, function (match) {
      return match+CHEATS;
    })
    fs.writeFile(bundlerIndexPath, source, function (err) {
      if (err) throw err;
      console.log('set module-id-factory done .');
    });
  });
}