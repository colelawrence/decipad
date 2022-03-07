import { PadRecord, User } from '@decipad/backendtypes';
import Boom from '@hapi/boom';
import { Element, Node } from 'slate';
import { create as createContent } from '../pad-content';
import { create as createPad } from './create';

export async function importDoc(
  workspaceId: string,
  source: string,
  user: User
): Promise<PadRecord> {
  let doc: Node[] | undefined;
  try {
    const root = JSON.parse(source);
    if (!Element.isElement(root)) {
      throw Boom.badData(
        "Cannot import notebook because it's not a valid Slate Element"
      );
    }
    doc = root.children;
  } catch (err) {
    throw Boom.notAcceptable(
      `Error parsing import content: ${(err as Error).message}`
    );
  }

  if (!doc) {
    throw Boom.notAcceptable('no document to import');
  }

  const pad = await createPad(workspaceId, { name: 'Imported notebook' }, user);
  await createContent(pad.id, doc);
  return pad;
}
