import { AnyElement, MyNode } from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

const mergeChildren = <T extends AnyElement>(a: T, b: T): T['children'] => {
  return b.children.map((child) => {
    if (!isElement(child)) {
      return child;
    }
    const matchChild = (a.children as MyNode[]).find(
      (childOfA: MyNode) => isElement(childOfA) && childOfA.id === child.id
    );
    if (matchChild && isElement(matchChild)) {
      // eslint-disable-next-line no-use-before-define
      return mergeProps(matchChild as AnyElement, child as AnyElement);
    }
    return child;
  }) as AnyElement['children'];
};

export const mergeProps = <T1 extends AnyElement, T2 extends AnyElement>(
  old: T1,
  _new: T2
): T2 => {
  // remove all the undefined properties of the new version
  const neww = Object.fromEntries(
    Object.entries(_new).filter((_key, value) => value != null)
  ) as T2;
  if (
    isElement(old) &&
    isElement(neww) &&
    old.type === neww.type &&
    old.id === neww.id
  ) {
    return {
      ...old,
      ...neww,
      children: mergeChildren(old, neww as unknown as typeof old),
    };
  }
  return neww;
};
