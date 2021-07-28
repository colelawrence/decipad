import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import arc from '@architect/functions';
import Automerge from 'automerge';
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

  let doc = await get(id);

  if (!doc) {
    return {
      statusCode: 404,
    };
  }
  const before = Automerge.load(doc);

  if (!event.body) {
    return {
      statusCode: 401,
      body: 'Need some changes',
    };
  }
  const body = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString()
    : event.body;

  const changes = JSON.parse(body);
  if (changes.length > 0) {
    const after = Automerge.applyChanges(before, changes);
    doc = Automerge.save(after);

    await put(id, doc);

    // Notify room

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

  return { ok: true };
});
