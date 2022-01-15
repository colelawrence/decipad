import {
  ID,
  PadInput,
  TableRecordIdentifier,
  PadRecord,
} from '@decipad/backendtypes';
import { nanoid } from 'nanoid';
import tables from '@decipad/tables';
import { create as createResourcePermission } from '../permissions';

export async function create(
  workspaceId: ID,
  pad: PadInput,
  user: TableRecordIdentifier
): Promise<PadRecord> {
  const newPad = {
    id: nanoid(),
    name: pad.name,
    workspace_id: workspaceId,
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
