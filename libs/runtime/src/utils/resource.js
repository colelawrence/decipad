export function encode(id) {
  let newId = id.replace(/\//g, ':');
  if (newId.startsWith(':')) {
    newId = newId.substring(1);
  }
  return newId;
}

export function decode(id) {
  let newId = id.replace(/:/g, '/');
  if (!newId.startsWith('/')) {
    newId = '/' + newId;
  }
  return newId;
}
