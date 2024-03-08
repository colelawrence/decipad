import { MyElement, MyNode } from '@decipad/editor-types';
import { useEditorController } from './useActiveEditor';
import { TNode, TNodeEntry, isElement } from '@udecode/plate-common';
import { Path } from 'slate';

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
  const controller = useEditorController();
  if (controller) {
    return findGlobalNode(controller.children, (node) => {
      return (
        isElement(node) && node.children.some((child) => child.id === el.id)
      );
    });
  }
  return undefined;
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
  const controller = useEditorController();
  if (controller) {
    return findGlobalNodeEntry(controller.children, (node) => {
      return (
        isElement(node) && node.children.some((child) => child.id === el.id)
      );
    });
  }
  return undefined;
};

export const useGlobalFindNode = () => {
  const controller = useEditorController();
  if (controller == null) {
    return undefined;
  }

  return (selector: Parameters<typeof findGlobalNode>[1]) =>
    findGlobalNode(controller.children, selector);
};
