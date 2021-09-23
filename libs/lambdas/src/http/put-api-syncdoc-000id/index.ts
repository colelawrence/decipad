/* eslint-disable no-underscore-dangle */
import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import Boom from '@hapi/boom';
import Automerge from 'automerge';
import { getDefined } from '@decipad/utils';
import arc from '@architect/functions';
import tables from '@decipad/services/tables';
import { expectAuthenticated } from '@decipad/services/authentication';
import { expectAuthorized } from '@decipad/services/authorization';
import {
  get as getPadContent,
  putTemp as putPadTempContent,
  commit as commitPadContent,
} from '@decipad/services/blobs/pads';
import { DocSyncRecord } from '@decipad/backendtypes';
import { decode } from '../../common/resource';
import handle from '../handle';

export const handler = handle(async (event: APIGatewayProxyEvent) => {
  const id = decode(event.pathParameters?.id);

  const { user } = await expectAuthenticated(event);
  await expectAuthorized({ resource: id, user, permissionType: 'WRITE' });

  if (!event.body) {
    throw Boom.notAcceptable('no body');
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString()
    : event.body;

  const data = await tables();
  let changes: Automerge.Change[] | undefined;
  let tempFile: string | undefined;
  const docSync = await data.docsync.withLock(
    id,
    async (rec: DocSyncRecord = { id, _version: 0 }) => {
      [changes, tempFile] = await mergeAndSave(id, rec._version, body);
      return rec;
    }
  );
  await commitPadContent(
    getDefined(tempFile, 'temp file handle is not defined'),
    id,
    docSync._version
  );
  if (changes && changes.length > 0) {
    await publishChanges(id, changes);
  }

  return { ok: true };
});

async function mergeAndSave(
  id: string,
  previousVersion: number,
  encodedDoc: string
): Promise<[Automerge.Change[], string | undefined]> {
  let doc = await getPadContent(id, previousVersion);
  let needsCreate = false;
  let changes: Automerge.Change[] = [];

  if (!doc) {
    needsCreate = true;
    doc = encodedDoc;
  } else {
    const before = Automerge.load(doc);
    const remote = Automerge.load(encodedDoc);
    const after = Automerge.merge(before, remote);
    doc = Automerge.save(after);
    changes = Automerge.getChanges(before, after);
  }

  let tempHandle: string | undefined;
  if (changes.length > 0 || needsCreate) {
    tempHandle = await putPadTempContent(id, doc);
  }

  return [changes, tempHandle];
}

async function publishChanges(id: string, changes: Automerge.Change[]) {
  if (changes.length > 0) {
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
}
