import { User } from '@decipad/backendtypes';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import { getDefined } from '@decipad/utils';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import Boom from '@hapi/boom';
import { applyUpdate, Doc as YDoc } from 'yjs';
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

const serialize = (_: string, value: unknown): unknown =>
  typeof value === 'bigint' ? value.toString() : value;

function exportPad(id: string, remoteUpdates?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new YDoc();
      const provider = new DynamodbPersistence(`/pads/${id}`, doc);
      provider.once('fetched', () => {
        if (remoteUpdates) {
          const update = Buffer.from(remoteUpdates, 'base64');
          applyUpdate(doc, update, 'remote');
        }
        try {
          const json = { children: doc.getArray().toJSON() };
          resolve(JSON.stringify(json, serialize, '\t'));
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

  const response = await exportPad(padId, event.body);
  return {
    statusCode: 200,
    body: response,
  };
});
