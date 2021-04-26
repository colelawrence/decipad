const baseUrl = require('./base-url');

module.exports = async function callSimple(url, options) {
  const response = await fetch(baseUrl + url, options);
  if (!response.ok) {
    throw new Error(
      'response was not ok: ' + response.status + ' : ' + response.body
    );
  }

  return response;
};
