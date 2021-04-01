'use strict';

const tiny = require('tiny-json-http');

const baseUrl = 'http://localhost:3333';

function get(url, options = {}) {
  const opts = Object.assign({}, options, {
    url: baseUrl + url,
  });
  return tiny.get(opts);
}

function post(url, data = null, options = {}) {
  const opts = Object.assign({}, options, {
    url: baseUrl + url,
    data,
  });
  return tiny.post(opts);
}

function put(url, data = null, options = {}) {
  const opts = Object.assign({}, options, {
    url: baseUrl + url,
    data,
  });
  return tiny.put(opts);
}

function del(url, options = {}) {
  const opts = Object.assign({}, options, {
    url: baseUrl + url,
  });
  return tiny.put(opts);
}

const callSandbox = {
  get,
  put,
  del,
  post,
};

module.exports = callSandbox;
