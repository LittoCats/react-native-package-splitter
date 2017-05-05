exports.ELF = function (str) {
  var hash = 0, index = 0, code;
  for (var i = 0; i < str.length; i++) {
    code = str.charCodeAt(i);;
    hash = (hash << 4) + code;
    if ((index = hash & 0xF0000000) != 0) {
      hash ^= index >> 24;
      hash &= ~index;
    }
  }
  return hash & 0x7fffffff;
}

if (require.main == module) {
  console.log(exports.ELF('adafsae'))
}