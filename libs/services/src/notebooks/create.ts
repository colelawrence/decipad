import type {
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
  workspaceId: ID | undefined,
  pad: PadInput,
  user?: TableRecordIdentifier,
  padId?: string,
  createdAt?: number
): Promise<PadRecord> {
  // eslint-disable-next-line no-console
  console.log('create pad', user, padId);
  const newPad = {
    ...pad,
    id: padId ?? nanoid(),
    workspace_id: workspaceId,
    createdAt: createdAt ?? timestamp(),
  };

  const data = await tables();
  await data.pads.create(newPad);

  if (user) {
    await createResourcePermission({
      resourceType: 'pads',
      resourceId: newPad.id,
      userId: user.id,
      type: 'ADMIN',
      givenByUserId: user.id,
      canComment: true,
      parentResourceUri: `/workspaces/${workspaceId}`,
    });
  }

  return newPad;
}
