import { nanoid } from 'nanoid';
import tables from '../tables';
import createResourcePermission from '../resource-permissions/create';

async function create(
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
  await data.pads.put(newPad);

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

export default create;
