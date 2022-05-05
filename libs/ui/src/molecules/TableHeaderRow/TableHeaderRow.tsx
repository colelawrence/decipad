import { PlateComponentAttributes } from '@decipad/editor-types';
import { useStyle } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, ReactNode } from 'react';
import { Create } from '../../icons';
import { strongOpacity, transparency } from '../../primitives';
import { table } from '../../styles';
import {
  AvailableSwatchColor,
  baseSwatches,
  defaultTableColor,
} from '../../utils';

const createColumnThStyles = css({
  minHeight: table.thMinHeight,
  width: table.buttonColumnWidth,

  padding: 0,
});

const buttonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
});

const iconWrapperStyles = css({
  height: '20px',
  width: '20px',
});

interface TableHeaderRowProps {
  readonly children: ReactNode;
  readonly actionsColumn?: boolean;
  readonly onAddColumn?: () => void;
  readonly readOnly?: boolean;
  readonly attributes?: PlateComponentAttributes;
}

export const TableHeaderRow = ({
  children,
  actionsColumn = true,
  onAddColumn = noop,
  readOnly = false,
  attributes,
}: TableHeaderRowProps): ReturnType<FC> => {
  const { color = defaultTableColor } = useStyle();
  return (
    <tr
      {...attributes}
      css={{
        display: 'grid',
        gridTemplate: table.rowTemplate(
          Children.toArray(children).length,
          !actionsColumn
        ),
      }}
    >
      {children}
      {actionsColumn && (
        <th
          contentEditable={false}
          css={[
            createColumnThStyles,
            css({
              backgroundColor: transparency(
                baseSwatches[color as AvailableSwatchColor],
                strongOpacity
              ).rgba,
              '&:hover, &:focus-within': {
                backgroundColor:
                  baseSwatches[color as AvailableSwatchColor].rgb,
              },
              boxShadow: `inset 0px -2px 0px ${
                baseSwatches[color as AvailableSwatchColor].rgb
              }`,
            }),
          ]}
        >
          {!readOnly && (
            <button css={buttonStyles} onClick={onAddColumn}>
              <span css={iconWrapperStyles}>
                <Create />
              </span>
            </button>
          )}
        </th>
      )}
    </tr>
  );
};
