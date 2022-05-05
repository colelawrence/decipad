import { Children, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { TableData } from '../../atoms';
import { Minus } from '../../icons';
import { table } from '../../styles';

const buttonStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  width: '100%',
  paddingLeft: '12px',
  paddingRight: '12px',
});

const iconWrapperStyles = css({
  height: '20px',
  width: '20px',
});

interface TableRowProps {
  readonly attributes?: PlateComponentAttributes;
  readonly children: ReactNode;
  readonly onRemove?: () => void;
  readonly readOnly?: boolean;
}

export const TableRow = ({
  attributes,
  children,
  onRemove = noop,
  readOnly = false,
}: TableRowProps): ReturnType<FC> => {
  return (
    <tr
      {...attributes}
      css={css({
        display: 'grid',
        gridTemplate: table.rowTemplate(
          Children.toArray(children).length,
          readOnly
        ),
      })}
    >
      {children}
      {!readOnly && (
        <TableData as="td">
          <button css={buttonStyles} onClick={onRemove}>
            <span css={iconWrapperStyles}>
              <Minus />
            </span>
          </button>
        </TableData>
      )}
    </tr>
  );
};
