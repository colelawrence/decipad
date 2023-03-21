import {
  ID,
  PadInput,
  TableRecordIdentifier,
  PadRecord,
} from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import tables from '@decipad/tables';
import { timestamp } from '@decipad/backend-utils';
import { create as createResourcePermission } from '../permissions';

export async function create(
  workspaceId: ID,
  pad: PadInput,
  user: TableRecordIdentifier,
  padId?: string
): Promise<PadRecord> {
  const newPad = {
    ...pad,
    id: padId ?? nanoid(),
    workspace_id: workspaceId,
    createdAt: timestamp(),
  };

  const data = await tables();
  await data.pads.create(newPad);

  await createResourcePermission({
    resourceType: 'pads',
    resourceId: newPad.id,
    userId: user.id,
    type: 'ADMIN',
    givenByUserId: user.id,
    canComment: true,
    parentResourceUri: `/workspaces/${workspaceId}`,
  });

  return newPad;
}
