const tables = require('@architect/shared/tables');
const handle = require('@architect/shared/handle');

exports.handler = handle(async (event) => {
  const data = await tables();

  const validation = await data.userkeyvalidations.get({
    id: event.pathParameters.userkeyvalidationid,
  });

  if (!validation) {
    return {
      statusCode: 404,
      body: 'Validation not found',
    };
  }

  const key = await data.userkeys.get({ id: validation.userkey_id });
  key.validated_at = Date.now();
  await data.userkeys.put(key);

  await data.userkeyvalidations.delete({ id: validation.id });

  return {
    statusCode: 201,
  };
});
