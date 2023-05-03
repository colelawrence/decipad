import { cssVar } from '@decipad/ui';
import { TElement } from '@udecode/plate';
import { BlockSelectable as _BlockSelectable } from '@udecode/plate-selection';
import { ReactNode } from 'react';

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
    selectedColor: cssVar('tableSelectionBackgroundColor'),
  });
