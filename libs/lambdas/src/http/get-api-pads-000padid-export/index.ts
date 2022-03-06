import { User } from '@decipad/backendtypes';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { getDefined } from '@decipad/utils';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import Boom from '@hapi/boom';
import { Doc as YDoc } from 'yjs';
import handle from '../handle';

async function checkAccess(
  user: User | undefined,
  padId: string
): Promise<void> {
  if (!user) {
    throw Boom.forbidden('Needs authentication');
  }

  const resource = `/pads/${padId}`;
  await expectAuthorized({ resource, user, permissionType: 'READ' });
}

function exportPad(id: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new YDoc();
      const provider = new DynamodbPersistence(`/pads/${id}`, doc);
      provider.once('fetched', () => {
        try {
          const json = { children: doc.getArray().toJSON() };
          resolve(JSON.stringify(json, null, '\t'));
        } catch (err2) {
          reject(err2);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

export const handler = handle(async (event) => {
  const padId = getDefined(getDefined(event.pathParameters).padid);

  const [{ user }] = await expectAuthenticated(event);
  await checkAccess(user, padId);

  const response = await exportPad(padId);
  return {
    statusCode: 200,
    body: response,
  };
});
