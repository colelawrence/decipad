import { PadRecord, User } from '@decipad/backendtypes';
import { Document, MyValue } from '@decipad/editor-types';
import Boom from '@hapi/boom';
import { Element as SlateElement } from 'slate';
import { create as createContent } from '../pad-content';
import { applyReplaceList } from './applyReplaceList';
import { create as createPad } from './create';

export interface ImportNotebookContentProps {
  workspaceId: string;
  source: string | Document;
  user: User;
  pad?: PadRecord;
  padId?: string;
  replaceList?: Record<string, string>;
}

export const importNotebookContent = async ({
  workspaceId,
  source,
  user,
  pad,
  padId,
  replaceList,
}: ImportNotebookContentProps): Promise<PadRecord> => {
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
    doc = source.children;
  }

  if (!doc) {
    throw Boom.notAcceptable('no document to import');
  }

  if (replaceList) {
    doc = applyReplaceList(doc, replaceList);
  }

  if (!pad) {
    pad = await createPad(
      workspaceId,
      { name: 'Imported notebook' },
      user,
      padId
    );
  }

  await createContent(pad.id, doc);
  return pad;
};
