module.exports = function uri(...components) {
  return '/' + components.map(encodeURIComponent).join('/');
};