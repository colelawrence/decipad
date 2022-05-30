import { Children, FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import {
  AvailableSwatchColor,
  TableStyleContext,
  UserIconKey,
} from '../../utils';
import { VariableNameSelector } from '../../molecules';
import { cssVar } from '../../primitives';

const wrapperStyles = css({
  margin: '0',
  marginBottom: '8px',
  paddingBottom: '6px',
});

const tableWrapperStyles = css({
  display: 'grid',
  overflowX: 'auto',
});

const border = `1px solid ${cssVar('strongHighlightColor')}`;
const borderRadius = '6px';

const tableBaseStyles = css({
  // NOTE: border radius on the table does not work with `borderCollapse: collapse`,
  // that's why we need `borderCollapse: separate` on the table and to style <th>
  // and <td> separately for borders and border radius.
  borderCollapse: 'inherit',
  borderSpacing: '0',
  tableLayout: 'fixed',
});

// Top border and border-radius, applied to table headers if they exist or to the first table row.
// Bottom border-radius, applied to the last table row, whether it's inside the tfoot or tbody.
const borderRadiusStyles = css({
  '> thead > tr > th:first-of-type, > tbody:not(thead + tbody) > tr:first-of-type > td:first-of-type':
    {
      borderTopLeftRadius: borderRadius,
    },
  '> thead > tr > th:last-of-type, > tbody:not(thead + tbody) > tr:first-of-type > td:last-of-type':
    {
      borderTopRightRadius: borderRadius,
    },
  '> tbody > tr:last-of-type > th:last-of-type': {
    borderBottomRightRadius: borderRadius,
  },
});

const innerBorderStyles = css({
  '> thead > tr > th, > tbody > tr:not(:last-child) > th': {
    borderBottom: border,
  },
  '> thead > tr > th:not(:last-child), > tbody > tr > td:not(:last-child), > tfoot > tr > td:not(:last-child)':
    {
      borderRight: border,
    },
});

const allBorderStyles = css(innerBorderStyles, {
  '> thead > tr > th, > tbody > tr > td, > tfoot > tr > td': {
    borderRight: border,
    borderBottom: border,
  },
  '> thead > tr > th, > tbody:not(thead + tbody) > tr:first-of-type > td': {
    borderTop: border,
  },
  '> thead > tr > th:first-of-type, > tbody > tr > th:first-of-type': {
    borderLeft: border,
  },
});

interface PowerTableProps {
  readonly availableVariableNames: string[];
  readonly variableName: string;
  readonly icon: UserIconKey;
  readonly color: AvailableSwatchColor;
  readonly onChangeVariableName?: (varName: string) => void;
  readonly onChangeIcon?: (newIcon: UserIconKey) => void;
  readonly onChangeColor?: (newColor: AvailableSwatchColor) => void;
  children: ReactNode;
  data: ReactNode;
}

export const PowerTable: FC<PowerTableProps> = ({
  availableVariableNames,
  variableName,
  icon,
  color,
  onChangeVariableName = noop,
  onChangeIcon = noop,
  onChangeColor = noop,
  data,
  children,
}): ReturnType<FC> => {
  const [caption, thead] = Children.toArray(children);
  return (
    <div>
      <TableStyleContext.Provider
        value={{
          icon,
          color,
          setIcon: onChangeIcon,
          setColor: onChangeColor,
        }}
      >
        <div css={wrapperStyles}>
          {caption}
          <VariableNameSelector
            label="table"
            variableNames={availableVariableNames}
            selectedVariableName={variableName}
            onChangeVariableName={onChangeVariableName}
          />
          <div contentEditable={false} css={tableWrapperStyles}>
            <table css={[tableBaseStyles, borderRadiusStyles, allBorderStyles]}>
              <thead>{thead}</thead>
              <tbody>{data}</tbody>
            </table>
          </div>
        </div>
      </TableStyleContext.Provider>
    </div>
  );
};
