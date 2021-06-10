import arc from '@architect/functions';
import assert from 'assert';
import { nanoid } from 'nanoid';
import handle from '../../../queues/handler';

export const handler = handle(userKeyChangesHandler);

async function userKeyChangesHandler(event: TableRecordChanges<UserKey>) {
  const { table, action, args } = event;

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

  const data = await arc.tables();

  const user = await data.users.get({ id: args.user_id });

  if (!user) {
    return;
  }

  const newValidation = {
    id: nanoid(),
    userkey_id: args.id,
    expires_at:
      Math.round(Date.now() / 1000) +
      Number(process.env.DECI_KEY_VALIDATION_EXPIRATION_SECONDS || 2592000),
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

  await data.userkeys.put(userkey);
}
