import { LogRecord, User } from '@decipad/backendtypes';
import { expectAuthenticated } from '@decipad/services/authentication';
import { getDefined } from '@decipad/utils';
import Boom from '@hapi/boom';
import tables, { allPages } from '@decipad/tables';
import handle from '../handle';

const outputJSON = (json: string) =>
  JSON.stringify(JSON.parse(json), null, '\t');

const outputEntry = (entry: LogRecord): string => {
  return `${new Date((entry.createdAt ?? 0) * 1000).toISOString()}: ${
    entry.source
  }: ${outputJSON(entry.content)}\n`;
};

async function checkAccess(user: User | undefined) {
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  const data = await tables();
  const superAdmin = await data.superadminusers.get({ id: user.id });
  if (!superAdmin) {
    throw Boom.forbidden('user is not in the superadmins list');
  }
}

export const handler = handle(async (event) => {
  const padId = getDefined(getDefined(event.pathParameters).padid);

  const [{ user }] = await expectAuthenticated(event);
  await checkAccess(user);

  const data = await tables();
  let output = '';
  for await (const entry of allPages(data.logs, {
    KeyConditionExpression: '#resource = :resource',
    ExpressionAttributeNames: {
      '#resource': 'resource',
    },
    ExpressionAttributeValues: {
      ':resource': `/pads/${padId}`,
    },
  })) {
    if (entry) {
      output += outputEntry(entry);
    }
  }
  // console.log('entries:', entries);

  return {
    statusCode: 200,
    headers: {
      'content-type': 'text/plain',
    },
    body: output,
  };
});
