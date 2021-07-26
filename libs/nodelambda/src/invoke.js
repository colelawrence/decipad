const { workerFor } = require('./workers');

module.exports = function invokeByRunning(params, callback) {
  const { options, request, timeout, update } = params;
  const { env, cwd } = options;
  const functionPath = cwd + '/index.js';
  const headers = {
    'content-type': 'text/html; charset=utf8;',
    'cache-control':
      'no-cache, no-store, must-revalidate, max-age=0, s-maxage=0',
  };
  let returned = false;

  const event = JSON.parse(request);
  const worker = workerFor(functionPath, env, update);
  worker.work(event, (err, response) => {
    returned = true;
    done(err, response);
  });

  // Set an execution timeout
  let to = setTimeout(function () {
    let duration = `${timeout / 1000}s`;
    update.warn(
      `${functionPath} timed out after hitting its ${duration} timeout!`
    );
    done(new Error(`${duration} timeout`));
  }, timeout);

  // End execution
  function done(error, response) {
    clearTimeout(to); // ensure the timeout doesn't block
    if (error) {
      callback(null, {
        statusCode: 502,
        headers,
        body: `<h1>Requested function is missing or not defined, or unknown error</h1>
        <p>${error}</p>
        `,
      });
    } else if (returned) {
      const apiType = process.env.ARC_API_TYPE;
      if (apiType === 'http') {
        callback(null, response);
      } else if (response) {
        // If it's an error pretty print it
        if (response.name && response.message && response.stack) {
          response.body = `
          <h1>${response.name}</h1>
          <p>${response.message}</p>
          <pre>${response.stack}</pre>
          `;
          response.code = 500;
          response.type = 'text/html';
        }
        // otherwise just return the command line
        callback(null, response);
      } else {
        callback(null, {
          statusCode: 500,
          headers,
          body: `<h1>Async error</h1>
<p><strong>Lambda <code>${functionPath}</code> ran without executing the completion callback or returning a value.</strong></p>

<p>Dependency-free functions, or functions that use <code>@architect/functions arc.http.async()</code> must return a correctly formatted response object.</p>

<p>Functions that utilize <code>@architect/functions arc.http()</code> must ensure <code>res</code> gets called</p>

<p>Learn more about <a href="https://arc.codes/primitives/http">dependency-free responses</a>, or about using <code><a href="https://arc.codes/reference/functions/http/node/classic">arc.http()</a></code> and <code><a href="https://arc.codes/reference/functions/http/node/async">arc.http.async()</a></code></p>.
          `,
        });
      }
    } else {
      callback(null, {
        statusCode: 500,
        headers,
        body: `<h1>Error</h1>
        <p>Process exited<p>`,
      });
    }
  }
};
