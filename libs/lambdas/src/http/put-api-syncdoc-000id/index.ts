import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import Automerge from 'automerge';
import arc from '@architect/functions';
import tables from '@decipad/services/tables';
import { authenticate } from '@decipad/services/authentication';
import { isAuthorized } from '@decipad/services/authorization';
import { get, put } from '@decipad/services/blobs/pads';
import { decode } from '../../common/resource';
import handle from '../handle';

export const handler = handle(async (event: APIGatewayProxyEvent) => {
  const id = decode(event.pathParameters?.id);

  const { user } = await authenticate(event);
  if (!user || !(await isAuthorized(id, user, 'WRITE'))) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  if (!event.body) {
    return {
      status: 401,
      body: 'no body',
    };
  }

  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString()
    : event.body;

  let doc = await get(id);
  let needsCreate = false;
  let changes: Automerge.Change[] = [];

  if (!doc) {
    needsCreate = true;
    doc = body;
  } else {
    const before = Automerge.load(doc);
    const remote = Automerge.load(body);
    const after = Automerge.merge(before, remote);
    doc = Automerge.save(after);
    changes = Automerge.getChanges(before, after);
  }

  const data = await tables();

  if (changes.length > 0 || needsCreate) {
    await put(id, doc);
  }

  // publish changes

  if (changes.length > 0) {
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

  return { ok: true };
});
