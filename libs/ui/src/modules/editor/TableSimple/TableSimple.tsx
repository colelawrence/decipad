import styled from '@emotion/styled';
import { cssVar } from 'libs/ui/src/primitives';

type TableCellProps = {
  isLeft?: boolean;
  isTop?: boolean;

  topLeftRadius?: boolean;
  topRightRadius?: boolean;
  bottomRightRadius?: boolean;
  bottomLeftRadius?: boolean;
};

/**
 * This is a highly composable table.
 * It doesn't try to guess the table structure (thead, tbody, :first-child :last-child, etc),
 * It exposes explicity props to define borders.
 * This is specially useful for table with row/col span and colgroup.
 */

export const TableSimple = styled.table`
  width: 100%;
  border-collapse: separate; // Required for border-radius to work.
`;

export const TableCellSimple = styled.td<TableCellProps>`
  padding: 8px 12px;
  text-align: left;
  font-size: ${14 / 16}rem;
  line-height: 1.2;

  border-right: 1px solid ${cssVar('borderSubdued')};
  border-bottom: 1px solid ${cssVar('borderSubdued')};

  border-left: ${({ isLeft }) =>
    isLeft ? `1px solid ${cssVar('borderSubdued')}` : undefined};
  border-top: ${({ isTop }) =>
    isTop ? `1px solid ${cssVar('borderSubdued')}` : undefined};
  &:first-child {
  }

  border-top-left-radius: ${({ topLeftRadius }) =>
    topLeftRadius ? '8px' : undefined};
  border-top-right-radius: ${({ topRightRadius }) =>
    topRightRadius ? '8px' : undefined};
  border-bottom-left-radius: ${({ bottomLeftRadius }) =>
    bottomLeftRadius ? '8px' : undefined};
  border-bottom-right-radius: ${({ bottomRightRadius }) =>
    bottomRightRadius ? '8px' : undefined};
`;

export const TableHeadSimple = styled(TableCellSimple)`
  background-color: ${cssVar('tableHeaderBackground')};
`;

TableHeadSimple.defaultProps = {
  as: 'th',
};
