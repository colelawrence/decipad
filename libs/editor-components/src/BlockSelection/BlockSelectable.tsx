import { TElement } from '@udecode/plate';
import { ReactNode } from 'react';
import { BlockSelectable as _BlockSelectable } from '@udecode/plate-selection';

export const BlockSelectable = ({
  element,
  children,
}: {
  element: TElement;
  children: ReactNode;
}) =>
  _BlockSelectable({
    element,
    children,
    selectedColor: 'rgb(219 234 254)',
  });
