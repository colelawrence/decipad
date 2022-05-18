import { PadRecord, User } from '@decipad/backendtypes';
import { MyElement } from '@decipad/editor-types';
import Boom from '@hapi/boom';
import { isElement } from '@udecode/plate';
import { create as createContent } from '../pad-content';
import { create as createPad } from './create';

export interface ImportDocProps {
  workspaceId: string;
  source: string;
  user: User;
  pad?: PadRecord;
}

export async function importDoc({
  workspaceId,
  source,
  user,
  pad,
}: ImportDocProps): Promise<PadRecord> {
  let doc: MyElement[] | undefined;
  try {
    const root = JSON.parse(source);
    if (!isElement(root)) {
      throw Boom.badData(
        "Cannot import notebook because it's not a valid Slate Element"
      );
    }
    doc = root.children as MyElement[];
  } catch (err) {
    throw Boom.notAcceptable(
      `Error parsing import content: ${(err as Error).message}`
    );
  }

  if (!doc) {
    throw Boom.notAcceptable('no document to import');
  }

  if (!pad) {
    pad = await createPad(workspaceId, { name: 'Imported notebook' }, user);
  }

  await createContent(pad.id, doc);
  return pad;
}
