/* eslint-disable no-underscore-dangle */
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import arc from '@architect/functions';
import Automerge from 'automerge';
import tables from '@decipad/services/tables';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import {
  get as getPadContent,
  putTemp as putPadTempContent,
  commit as commitPadContent,
} from '@decipad/services/blobs/pads';
import { DocSyncRecord, ID } from '@decipad/backendtypes';
import { getDefined } from '@decipad/utils';
import { decode } from '../../common/resource';
import handle from '../handle';

export const handler = handle(async (event: APIGatewayProxyEvent) => {
  const id = decode(event.pathParameters?.id);
  const { user } = await authenticate(event);

  if (!event.body) {
    return {
      statusCode: 401,
      body: 'Need some changes',
    };
  }

  if (!user || !(await isAuthorized(id, user, 'WRITE'))) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  const data = await tables();
  const doc = await data.docsync.get({ id });

  if (!doc) {
    return {
      statusCode: 404,
      body: 'not found',
    };
  }

  let changes: Automerge.Change[] | undefined;
  let tempHandle: string | undefined;

  const newRecord = await data.docsync.withLock(
    id,
    async (docsync: DocSyncRecord = { id, _version: 0 }) => {
      const content = getDefined(await getPadContent(id, docsync._version));
      const before = Automerge.load(content);

      const body = event.isBase64Encoded
        ? Buffer.from(getDefined(event.body), 'base64').toString()
        : getDefined(event.body);

      changes = JSON.parse(body);
      if (changes && changes.length > 0) {
        const after = Automerge.applyChanges(before, changes);
        const newPadContent = Automerge.save(after);

        tempHandle = await putPadTempContent(id, newPadContent);
      }
      return docsync;
    }
  );

  if (tempHandle) {
    await commitPadContent(tempHandle, id, newRecord._version);
  }

  if (changes) {
    await notify(id, changes);
  }

  return { ok: true };
});

async function notify(id: ID, changes: Automerge.Change[]): Promise<void> {
  const data = await tables();
  const collabs = await data.collabs.query({
    IndexName: 'room-index',
    KeyConditionExpression: 'room = :room',
    ExpressionAttributeValues: {
      ':room': id,
    },
  });

  for (const collab of collabs.Items) {
    try {
      await arc.ws.send({
        id: collab.conn,
        payload: { o: 'c', t: id, c: changes },
      });
    } catch (err) {
      console.error(err);
    }
  }
}
