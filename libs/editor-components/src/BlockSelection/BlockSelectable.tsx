import { cssVar } from '@decipad/ui';
import type { TElement } from '@udecode/plate-common';
import { BlockSelectable as _BlockSelectable } from '@udecode/plate-selection';
import type { ReactNode } from 'react';

export const BlockSelectable = ({
  element,
  children,
}: {
  element: TElement;
  children: ReactNode;
}) =>
  _BlockSelectable({
    options: {
      element,
      selectedColor: cssVar('backgroundHeavy'),
    },
    children,
  });
