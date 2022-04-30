import { ElementType, FC, ReactNode } from 'react';
import { css, jsx } from '@emotion/react';
import { PlateComponentAttributes } from '@decipad/editor-types';
import { cssVar, p12Medium, p14Medium, setCssVar } from '../../primitives';
import { table } from '../../styles';
import { tableRowCounter } from '../../utils';

const lineNumberWidth = '22px';

const tdBaseStyles = css(p14Medium, {
  overflowX: 'hidden',
  alignItems: 'center',

  background: cssVar('backgroundColor'),

  minHeight: table.tdMinHeight,
  verticalAlign: 'middle',

  lineHeight: table.cellLineHeight,
  paddingRight: '12px',
});

const tdPlaceholderStyles = css({
  // Show line numbers on the first cell of each row.
  position: 'relative',

  '&:first-of-type': {
    paddingLeft: '34px',
  },
  '&:first-of-type::before': {
    ...setCssVar('normalTextColor', cssVar('weakTextColor')),
    ...p12Medium,
    backgroundColor: cssVar('backgroundColor'),

    counterIncrement: tableRowCounter,
    content: `counter(${tableRowCounter})`,

    position: 'absolute',
    right: `calc(100% - ${lineNumberWidth})`,
    top: '50%',
    transform: 'translateY(-50%)',
    fontVariantNumeric: 'tabular-nums',
  },
});

const tdGridStyles = {
  display: 'grid',
};

const editableStyles = css({
  paddingLeft: '12px',
});

export interface TableDataProps {
  as?: ElementType;
  isEditable?: boolean;
  className?: string;
  attributes?: PlateComponentAttributes;
  children?: ReactNode;
  showPlaceholder?: boolean;
}

export const TableData = ({
  as = 'div',
  className,
  isEditable = false,
  attributes,
  children,
  showPlaceholder = true,
}: TableDataProps): ReturnType<FC> => {
  return jsx(
    as,
    {
      ...(attributes || {}),
      css: [
        isEditable && editableStyles,
        tdBaseStyles,
        tdGridStyles,
        showPlaceholder && tdPlaceholderStyles,
      ],
      className,
    },
    children
  );
};
