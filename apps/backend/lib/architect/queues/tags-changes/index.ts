import assert from 'assert';
import tables from '../../../tables';
import handle from '../../../queues/handler';
import allPages from '../../../tables/all-pages';
import parseResourceUri from '../../../utils/parse-resource-uri';

export const handler = handle(tagsChangesHandler);

async function tagsChangesHandler(event: TableRecordChanges<TagRecord>) {
  const { table, action, args } = event;

  assert.equal(table, 'tags');

  if (action === 'put') {
    await handleTagCreate(args);
  }
  if (action === 'delete') {
    await handleTagDelete(args);
  }
}

async function handleTagCreate(tag: TagRecord) {
  const data = await tables();

  const resource = parseResourceUri(tag.resource_uri);
  assert.equal(resource.type, 'pads');

  const pad = await data.pads.get({ id: resource.id });
  if (!pad) {
    return;
  }

  const workspaceId = pad.workspace_id;

  const query = {
    IndexName: 'byResource',
    KeyConditionExpression: 'resource_uri = :resource_uri',
    FilterExpression: 'user_id <> :user_id',
    ExpressionAttributeValues: {
      ':resource_uri': tag.resource_uri,
      ':user_id': 'null'
    },
  };

  for await (const perm of allPages(data.permissions, query)) {
    const newUserTaggedResource = {
      id: `/workspaces/${workspaceId}/users/${perm.user_id}/tags/${encodeURIComponent(tag.tag)}${perm.resource_uri}`,
      user_id: perm.user_id,
      tag: tag.tag,
      workspace_id: workspaceId,
      resource_uri: perm.resource_uri,
    };

    await data.usertaggedresources.put(newUserTaggedResource);
  }
}

async function handleTagDelete({ id }: TableRecordIdentifier) {
  const tagId = parseTagId(id);
  const resource = `/${tagId.type}/${tagId.id}`;

  const query = {
    IndexName: 'byResourceAndTag',
    KeyConditionExpression: 'resource_uri = :resource_uri and tag = :tag',
    ExpressionAttributeValues: {
      ':resource_uri': resource,
      ':tag': tagId.tag,
    },
  }

  const data = await tables();

  for await (const userTaggedResource of allPages(data.usertaggedresources, query)) {
    await data.usertaggedresources.delete({ id: userTaggedResource.id });
  }
}

function parseTagId(id: string): Resource & { tag: string } {
  const parts = id.split('/');
  let resource: string | undefined = undefined;
  const idParts = [];
  let inTag = false;
  const tag = [];
  for (const part of parts) {
    if (!part) {
      continue;
    }
    if (!resource) {
      resource = part;
      continue;
    }
    if (inTag) {
      tag.push(decodeURIComponent(part));
      continue;
    }
    if (part === 'tags') {
      inTag = true;
      continue;
    }
    if (!inTag) {
      // still id
      idParts.push(part);
    }
  }

  return {
    type: resource!,
    id: idParts.join('/'),
    tag: tag.join('/'),
  };
}