import { FC, ReactNode, useContext } from 'react';
import { css } from '@emotion/react';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { normalOpacity, transparency } from '../../primitives';
import {
  AvailableSwatchColor,
  baseSwatches,
  TableStyleContext,
} from '../../utils';

export interface PowerTableColumnHeaderRowProps {
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
}

const columnHeaderStyles = (color: AvailableSwatchColor | undefined) =>
  css({
    backgroundColor:
      color &&
      transparency(baseSwatches[color as AvailableSwatchColor], normalOpacity)
        .rgba,
    // Keep hover effect when hovered, focused or the dropdown menu is opened.

    boxShadow:
      color &&
      `inset 0px -2px 0px ${baseSwatches[color as AvailableSwatchColor].rgb}`,
  });

export const PowerTableColumnHeaderRow = ({
  attributes,
  children,
}: PowerTableColumnHeaderRowProps): ReturnType<FC> => {
  const { color } = useContext(TableStyleContext);
  return (
    <tr {...attributes} contentEditable={false} css={columnHeaderStyles(color)}>
      {children}
    </tr>
  );
};
