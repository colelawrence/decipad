const arc = require('@architect/functions');
const assert = require('assert');
const { nanoid } = require('nanoid');
const tables = require('@architect/shared/tables');

const inTesting = !!process.env.JEST_WORKER_ID;

exports.handler = arc.queues.subscribe(userKeyChangesHandler);

async function userKeyChangesHandler({ table, action, args }) {
  if (inTesting) {
    return;
  }
  assert.equal(table, 'userkeys');
  if (action === 'delete') {
    return;
  }

  assert.equal(action, 'put');

  if (!args.id.startsWith('email:')) {
    return;
  }

  if (args.validated_at || args.validation_msg_sent_at) {
    return;
  }

  const data = await tables();

  const user = await data.users.get({ id: args.user_id });

  if (!user) {
    return;
  }

  const newValidation = {
    id: nanoid(),
    userkey_id: args.id,
    expires_at:
      Math.round(Date.now() / 1000) +
      Number(process.env.DECI_KEY_VALIDATION_EXPIRATION_SECONDS),
  };

  await data.userkeyvalidations.put(newValidation);

  const validationLink = `${process.env.DECI_APP_URL_BASE}/api/userkeyvalidations/${newValidation.id}/validate`;

  const email = args.id.substring('email:'.length);

  await arc.queues.publish({
    name: `sendemail`,
    payload: {
      ...args,
      template: 'email-validation',
      validationLink,
      email,
      name: user.name,
    },
  });

  const userkey = await data.userkeys.get({ id: args.id });
  userkey.validation_msg_sent_at = Date.now();

  data.userkeys.put(userkey);
}
