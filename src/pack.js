var fs = require('fs');
var path = require('path');
var Crypto = require('crypto');
var program = require('commander');
var mkdirp = require('../lib/mkdirp')
var Hash = require('../lib/hash')

exports.pack = function () {
  if (program.input === PROJ_ROOT) {
    throw new Error('this command only support build subdir source from PROJ_ROOT');
  }
  
  var cli = require(path.resolve(PROJ_ROOT, 'node_modules/react-native/cli.js'));
  cli.run();
  scanInputDir(program.input, splitModulesMap);
  // 所有处理结果时，生成过滤包
  process.on('exit', buildFilteredPackage);
}



var PROJ_ROOT = path.resolve(__dirname.replace('node_modules', ''), '../..');
var packageInfo = require(path.resolve(PROJ_ROOT, 'package.json'));

program.version('1.0.0')
.option('-i --input [string]', 'The folder for split package', function (input) {
  return path.resolve(input);
})
.option('-p --platform [string]', 'ios or android', function (platform) {
  platform = platform.toLowerCase();
  if (platform === 'android') return platform;
  return 'ios';
}, 'ios')
.parse(process.argv);

program.output = path.resolve(PROJ_ROOT, 'build', [
  packageInfo.name,
  packageInfo.version,
  program.input.slice(PROJ_ROOT.length+1).replace(/\/+/g, '.')
].join('.'));

if (!fs.existsSync(program.input)) {
  throw new Error('miss --input option');
}

if (fs.statSync(program.input).isFile()) {
  throw new Error(['--input', program.input, 'is not a directory'].join(' '));
}

mkdirp(program.output.split(/\//g).slice(0, -1).join('/'));

// 切换参数
process.argv = process.argv.slice(0, 2);

process.argv.push(
  'bundle',
  '--entry-file', path.resolve(program.input, 'index.js'),
  '--bundle-output', program.output,
  '--platform', program.platform,
  '--dev', 'false',
  '--reset-cache'
);

// 处理打包结果，过滤 input
var splitModulesMap = {};

function scanInputDir(dir, map) {
  fs.readdir(dir, function (err, dirs) {
    if (err) throw err;
    dirs.map(function (file) {
      file = path.resolve(dir, file);
      if (fs.statSync(file).isFile()) {
        file = file.slice(PROJ_ROOT.length+1);
        map[Hash.ELF(file)] = file;
      }else{
        scanInputDir(file, map);
      }
    });
  });
}

function buildFilteredPackage(code) {
  if (code != 0) return;
  var bundle = fs.readFileSync(program.output).toString().split('\n').map(function (line) {
    if (line.slice(0, 3) != '__d' || !/\d+\);$/.test(line)) return [];
    var id = line.match(/\d+\);$/)[0].slice(0, -2);
    if (splitModulesMap[id]){
      return [line];
    }
    return [];
  }).reduce(function (pre, cur) {
    return pre.concat(cur);
  }).join('\n');

  fs.writeFileSync(program.output, bundle);

  // md5 校验
  var md5 = Crypto.createHash('md5').update(bundle).digest('hex');
  var meta = [program.output, 'meta'].join('.');
  fs.writeFileSync(meta, md5);

  console.log('\npack: build splited package done.')
}