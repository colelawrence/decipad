import type { PadRecord, User } from '@decipad/backendtypes';
import type { Document, MyValue } from '@decipad/editor-types';
import Boom from '@hapi/boom';
import type { TNode } from '@udecode/plate-common';
import { Node, Element as SlateElement } from 'slate';
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

const findInvalidNodes = (node: TNode, invalidNodes: TNode[] = []) => {
  if (!Node.isNode(node)) {
    invalidNodes.push(node);
  }

  if (Array.isArray(node.children)) {
    node.children.forEach((child) => findInvalidNodes(child, invalidNodes));
  }
};

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
        const invalidNodes: TNode[] = [];
        root.children.forEach((child) => findInvalidNodes(child, invalidNodes));

        const problematicChildren = invalidNodes.map(
          (node) => node.id || JSON.stringify(node)
        );
        // eslint-disable-next-line no-console
        throw Boom.badData(
          `Invalid slate nodes with id: ${JSON.stringify(
            problematicChildren,
            null,
            2
          )}`
        );
      }
      doc = root.children as MyValue;
    } catch (err) {
      throw Boom.notAcceptable(`Import error: ${(err as Error).message}`);
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
