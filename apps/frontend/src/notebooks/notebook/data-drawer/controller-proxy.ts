import {
  DataTabChildrenElement,
  ELEMENT_LAYOUT,
  TopLevelValue,
} from '@decipad/editor-types';
import { EditorController } from '@decipad/notebook-tabs';
import { noop } from '@decipad/utils';
import { isElement, TEditor, TOperation } from '@udecode/plate-common';
import { Subscription } from 'rxjs';
import { Path } from 'slate';

export const findTopLevelEntry = (
  controller: EditorController,
  blockId: string
): [TopLevelValue | DataTabChildrenElement, Path] | undefined => {
  for (const [index, topLevel] of controller.children.entries()) {
    for (const [childIndex, child] of topLevel.children.entries()) {
      if (!isElement(child)) continue;

      if (child.type === ELEMENT_LAYOUT) {
        for (const [colIndex, layoutChild] of child.children.entries()) {
          if (layoutChild.id === blockId) {
            return [layoutChild, [index, childIndex, colIndex]];
          }
        }
      }

      if (child.id === blockId) {
        return [child, [index, childIndex]];
      }
    }
  }

  return undefined;
};

export const controllerProxy = (
  controller: EditorController,
  blockId: string
): ((op: TOperation) => void) => {
  return (op: TOperation) => {
    if (op.type === 'set_selection') {
      return;
    }

    //
    // We must find it each time, because it could happen that the editor blocks,
    // have shifted around, and therefore wouldn't catch this
    //
    const entry = findTopLevelEntry(controller, blockId);
    if (entry == null) {
      return;
    }

    const [, path] = entry;

    controller.apply({
      ...op,
      path: [...path, ...op.path.slice(1)],
    });
  };
};

export const controllerReverseProxy = <T extends TEditor>(
  controller: EditorController,
  editor: T,
  blockId: string,
  onClickAway: () => void = noop
): Subscription => {
  return controller.events.subscribe((e) => {
    if (
      e.type !== 'root-any-change' ||
      e.op == null ||
      e.op.type === 'move_node' ||
      e.op.type === 'merge_node' ||
      e.op.type === 'split_node'
    ) {
      return;
    }

    const entry = findTopLevelEntry(controller, blockId);
    if (entry == null) {
      return;
    }

    const [, path] = entry;

    if (e.op.type === 'set_selection') {
      const selectionPath = e.op.newProperties?.focus?.path;
      if (selectionPath == null) {
        return;
      }

      if (selectionPath == null || Path.isAncestor(path, selectionPath)) {
        return;
      }

      // if we reach here, the block path is not the parent of the selection
      // this means the user clicked on the editor.

      onClickAway();
      return;
    }

    if (path.length < 2 || e.op.path.length < 2) {
      return;
    }

    const [tabIndex, blockIndex] = path;
    const [opTabIndex, opBlockIndex] = e.op.path;

    if (tabIndex !== opTabIndex || blockIndex !== opBlockIndex) {
      return;
    }

    const adjustedPath = [0, ...e.op.path.slice(path.length)];

    editor.apply({
      ...e.op,
      path: adjustedPath,
      FROM_PROXY: true,
    });
  });
};
