import assert from 'assert';
import { nanoid } from 'nanoid';
import arc from '@architect/functions';
import { TableRecordChanges, UserKeyRecord } from '@decipad/backendtypes';
import { auth as authConfig, app as appConfig } from '@decipad/config';
import timestamp from '../../common/timestamp';
import handle from '../handle';

export const handler = handle(userKeyChangesHandler);

const { userKeyValidationExpirationSeconds } = authConfig();
const { urlBase } = appConfig();

async function userKeyChangesHandler(event: TableRecordChanges<UserKeyRecord>) {
  const { table } = event;

  assert.equal(table, 'userkeys');
  if (event.action !== 'put') {
    return;
  }

  const { args } = event;

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
    expires_at: timestamp() + userKeyValidationExpirationSeconds,
  };

  await data.userkeyvalidations.put(newValidation);

  const validationLink = `${urlBase}/api/userkeyvalidations/${newValidation.id}/validate`;

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
  userkey.validation_msg_sent_at = timestamp();

  await data.userkeys.put(userkey);
}
