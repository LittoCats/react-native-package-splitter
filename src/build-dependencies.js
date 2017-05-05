var path = require('path')

exports.build = function build() {
  var PROJ_ROOT = path.resolve(__dirname.replace('node_modules', ''), '../..');

  var packageInfo = require(path.resolve(PROJ_ROOT, 'package.json'))
  var dependencies = Object.keys(packageInfo.dependencies).map(function (dependence) {
    dependence = JSON.stringify(dependence);
    return ['exports[', dependence, '] = require(', dependence, ');'].join('');
  }).join('\n') + [
    '\n\nexports.package = ',
    JSON.stringify(packageInfo, null, 2)
  ].join('\n');

  process.stdout.write(dependencies);
}

if (require.main == module) {
  build();
}