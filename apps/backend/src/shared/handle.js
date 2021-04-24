'use strict';

module.exports = (fn) => {
  return async (req) => {
    try {
      const result = await fn(req);
      if (result === null || result === undefined) {
        return {
          statusCode: 404,
        };
      }

      if (typeof result === 'string') {
        return {
          statusCode: okStatusCodeFor(req),
          body: result,
          headers: {
            'content-type': 'text/text',
          },
        };
      }
      if (isFullReturnObject(result)) {
        return result;
      }
      return {
        statusCode: okStatusCodeFor(req),
        headers: {
          'content-type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify(result),
      };
    } catch (err) {
      console.error(err);
      return {
        statusCode: 500,
        json: {
          name: err.name,
          message: err.message,
          stack: err.stack,
        },
      };
    }
  };
};

function isFullReturnObject(result) {
  return !!result.statusCode || !!result.json;
}

function okStatusCodeFor(req) {
  const verb = req.routeKey.split(' ')[0];
  switch (verb) {
    case 'PUT':
    case 'DELETE':
      return 202;
    case 'POST':
      return 201;
  }
  return 200;
}
