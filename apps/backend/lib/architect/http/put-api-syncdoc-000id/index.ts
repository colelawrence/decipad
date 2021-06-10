import { APIGatewayProxyEventV2 as APIGatewayProxyEvent } from 'aws-lambda';
import Automerge from 'automerge';
import arc from '@architect/functions';
import handle from '../../../handle';
import tables from '../../../tables';
import auth from '../../../auth';
import { isAuthorized } from '../../../authorization';
import { decode } from '../../../resource';

type Resource = {
  type: string,
  id: string
};

export const handler = handle(async (event: APIGatewayProxyEvent) => {
  const id = decode(event.pathParameters?.id);
  const { user } = await auth(event);
  if (!user) {
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
  const data = await tables();
  let doc = await data.syncdoc.get({ id });
  let needsCreate = false;

  if (!doc) {
    doc = {
      id,
      latest: body,
    };
    needsCreate = true;
  } else if (!(await isAuthorized(id, user, 'WRITE'))) {
    return {
      status: 403,
      body: 'Forbidden',
    };
  }

  const before = Automerge.load(doc.latest);
  const remote = Automerge.load(body);
  const after = Automerge.merge(before, remote);
  doc.latest = Automerge.save(after);

  const changes = Automerge.getChanges(before, after);

  if (needsCreate) {
    const resource = parseId(id);
    const newRolePermission = {
      id: `/users/${user.id}/roles/null${id}`,
      resource_type: resource.type,
      resource_uri: id,
      resource_id: resource.id,
      user_id: user.id,
      role_id: 'null',
      given_by_user_id: user.id,
      can_comment: true,
      type: 'ADMIN',
    };

    await data.permissions.put(newRolePermission);
  }

  if (changes.length > 0) {
    await data.syncdoc.put(doc);

    // Notify room

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
  } else if (needsCreate) {
    await data.syncdoc.put(doc);
  }

  return { ok: true };
});

function parseId(id: string): Resource {
  if (!id.startsWith('/')) {
    id = '/' + id;
  }
  const parts = id.split('/');
  return {
    type: parts[1],
    id: parts[2],
  };
}
