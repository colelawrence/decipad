function encode(id) {
  let newId = id.replace(/\//g, ':');
  if (newId.startsWith(':')) {
    newId = newId.substring(1);
  }
  return newId;
}

function decode(id) {
  let newId = id.replace(/:/g, '/');
  if (!newId.startsWith('/')) {
    newId = '/' + newId;
  }
  return newId;
}

exports.encode = encode;
exports.decode = decode;
