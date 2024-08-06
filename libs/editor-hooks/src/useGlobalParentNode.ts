import type { MyElement, MyNode } from '@decipad/editor-types';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import type { TNode, TNodeEntry } from '@udecode/plate-common';
import { isElement } from '@udecode/plate-common';
import type { Path } from 'slate';

const findGlobalNode = <TN extends TNode>(
  children: TNode[],
  selector: (node: TNode) => boolean
): TN | undefined => {
  const found = children.find(selector);
  if (found) {
    return found as TN;
  }
  for (const child of children) {
    if (isElement(child)) {
      const foundInChild = findGlobalNode(child.children, selector);
      if (foundInChild) {
        return foundInChild as TN;
      }
    }
  }
  return undefined;
};

export const useGlobalParentNode = (el: MyElement): MyNode | undefined => {
  const controller = useNotebookWithIdState((s) => s.controller);
  if (controller == null) {
    return undefined;
  }

  return findGlobalNode(controller.children, (node) => {
    return (
      isElement(node) &&
      isElement(el) &&
      node.children.some((child) => isElement(child) && child.id === el.id)
    );
  });
};

const findGlobalNodeEntry = <TN extends TNode>(
  children: TNode[],
  selector: (node: TNode) => boolean,
  parentPath: Path = []
): TNodeEntry<TN> | undefined => {
  const foundIndex = children.findIndex(selector);
  if (foundIndex >= 0) {
    return [children[foundIndex] as TN, [...parentPath, foundIndex]];
  }

  let childIndex = -1;
  for (const child of children) {
    childIndex += 1;
    const childPath = [...parentPath, childIndex];
    if (isElement(child)) {
      const foundInChild = findGlobalNodeEntry(
        child.children,
        selector,
        childPath
      );
      if (foundInChild) {
        return foundInChild as TNodeEntry<TN>;
      }
    }
  }
  return undefined;
};

export const useGlobalParentNodeEntry = (
  el: MyElement
): TNodeEntry<MyNode> | undefined => {
  const controller = useNotebookWithIdState((s) => s.controller);
  if (controller == null) {
    return undefined;
  }
  return findGlobalNodeEntry(controller.children, (node) => {
    return (
      isElement(node) &&
      isElement(el) &&
      node.children.some((child) => isElement(child) && child.id === el.id)
    );
  });
};

export const useGlobalFindNodeEntry = () => {
  const controller = useNotebookWithIdState((s) => s.controller);
  if (controller == null) {
    return undefined;
  }

  return (selector: (_: TNode) => boolean) =>
    findGlobalNodeEntry(controller.children, selector);
};

export const useGlobalFindNode = () => {
  const controller = useNotebookWithIdState((s) => s.controller);
  if (controller == null) {
    return undefined;
  }

  return (selector: Parameters<typeof findGlobalNode>[1]) =>
    findGlobalNode(controller.children, selector);
};
