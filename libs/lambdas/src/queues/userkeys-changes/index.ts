import arc from '@architect/functions';
import { TableRecordChanges, UserKeyRecord } from '@decipad/backendtypes';
import { app as appConfig, auth as authConfig } from '@decipad/config';
import tables from '@decipad/tables';
import assert from 'assert';
import { nanoid } from 'nanoid';
import timestamp from '../../common/timestamp';
import handle from '../handle';

export const handler = handle(userKeyChangesHandler);

const { userKeyValidationExpirationSeconds } = authConfig();
const { urlBase } = appConfig();

const sendEmailValidationLink = false;

async function sendEmailValidationEmail(
  event: TableRecordChanges<UserKeyRecord>
) {
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

  if (!sendEmailValidationLink) {
    // TODO: send email validation link only after the user has signed in
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

async function removeFromAllowList(event: TableRecordChanges<UserKeyRecord>) {
  if (event.action !== 'put') {
    return;
  }

  const data = await tables();

  const { args } = event;
  const { id } = args;

  if (!id.startsWith('email:')) {
    return;
  }

  const email = id.slice('email:'.length);
  const allowListEntry = await data.allowlist.get({
    id: email.trim().toLocaleLowerCase(),
  });
  if (allowListEntry) {
    await data.allowlist.delete({ id });
  }
}

async function userKeyChangesHandler(event: TableRecordChanges<UserKeyRecord>) {
  const { table } = event;
  assert.strictEqual(table, 'userkeys');
  await sendEmailValidationEmail(event);
  await removeFromAllowList(event);
}
