import { PadRecord, User } from '@decipad/backendtypes';
import { Document, MyValue } from '@decipad/editor-types';
import Boom from '@hapi/boom';
import { Element as SlateElement } from 'slate';
import { create as createContent } from '../pad-content';
import { create as createPad } from './create';

export interface ImportDocProps {
  workspaceId: string;
  source: string | MyValue;
  user: User;
  pad?: PadRecord;
}

export async function importDoc({
  workspaceId,
  source,
  user,
  pad,
}: ImportDocProps): Promise<PadRecord> {
  let doc: MyValue | undefined;
  if (typeof source === 'string') {
    try {
      const root = JSON.parse(source) as Document;
      if (!root.children.every(SlateElement.isElement)) {
        throw Boom.badData(
          'Cannot import notebook because one of its blocks is not a valid Slate Element'
        );
      }
      doc = root.children as MyValue;
    } catch (err) {
      throw Boom.notAcceptable(
        `Error parsing import content: ${(err as Error).message}`
      );
    }
  } else {
    doc = source;
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
