import assert from 'assert';
import {
  TableRecordChanges,
  TableRecordIdentifier,
  Tag,
  UserTaggedResourceRecord,
  UserTagRecord,
} from '@decipad/backendtypes';
import tables from '@decipad/services/tables';
import { notifyOne } from '@decipad/services/pubsub';
import handle from '../handle';

export const handler = handle(userTaggedResourcesChangesHandler);

async function userTaggedResourcesChangesHandler(
  event: TableRecordChanges<UserTaggedResourceRecord>
) {
  const { table } = event;
  assert.equal(table, 'usertaggedresources');

  if (event.action === 'put') {
    await handleUserTaggedResourceCreate(event.args);
  } else if (event.action === 'delete') {
    await handleUserTaggedResourceDelete(event.args);
  }
}

async function handleUserTaggedResourceCreate(
  userTaggedResource: UserTaggedResourceRecord
) {
  const data = await tables();

  const userTagId = `/workspaces/${userTaggedResource.workspace_id}/users/${
    userTaggedResource.user_id
  }/tags/${encodeURIComponent(userTaggedResource.tag)}`;

  const userTag = await data.usertags.get({ id: userTagId });
  if (!userTag) {
    const newUserTag = {
      id: userTagId,
      workspace_id: userTaggedResource.workspace_id,
      user_id: userTaggedResource.user_id,
      tag: userTaggedResource.tag,
    };

    await data.usertags.put(newUserTag);

    const user = {
      id: userTaggedResource.user_id,
    };

    await notifyOne<Tag>(user, 'tagsChanged', {
      added: [
        {
          tag: newUserTag.tag,
          workspaceId: newUserTag.workspace_id,
        },
      ],
    });
  }
}

async function handleUserTaggedResourceDelete({ id }: TableRecordIdentifier) {
  const userTag = parseUserTaggedResourceId(id);

  const data = await tables();
  const hasMore =
    (
      await data.usertaggedresources.query({
        IndexName: 'byUserAndTag',
        KeyConditionExpression: 'user_id = :user_id and tag = :tag',
        FilterExpression: 'workspace_id = :workspace_id',
        ExpressionAttributeValues: {
          ':user_id': userTag.user_id,
          ':tag': userTag.tag,
          ':workspace_id': userTag.workspace_id,
        },
        Select: 'COUNT',
      })
    ).Count > 0;

  if (!hasMore) {
    const userTagId = `/workspaces/${userTag.workspace_id}/users/${
      userTag.user_id
    }/tags/${encodeURIComponent(userTag.tag)}`;
    await data.usertags.delete({ id: userTagId });
    const user = {
      id: userTag.user_id,
    };

    await notifyOne<Tag>(user, 'tagsChanged', {
      removed: [
        {
          tag: userTag.tag,
          workspaceId: userTag.workspace_id,
        } as Tag,
      ],
    });
  }
}

function parseUserTaggedResourceId(id: string): UserTagRecord {
  const parts = id.split('/').slice(1);
  return {
    id,
    workspace_id: parts[1],
    user_id: parts[3],
    tag: decodeURIComponent(parts[5]),
  };
}
