import { ElementType, FC, HTMLAttributes } from 'react';
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
  paddingRight: '12px',
});

const draggableStyles = css({
  userSelect: 'all',
  cursor: 'grab',
});

const grabbingStyles = css({
  cursor: 'grabbing',
});

export interface TableDataProps extends HTMLAttributes<HTMLDivElement> {
  as?: ElementType;
  isEditable?: boolean;
  attributes?: PlateComponentAttributes;
  showPlaceholder?: boolean;
  grabbing?: boolean;
}

export const TableData = ({
  as = 'div',
  className,
  isEditable = false,
  attributes,
  children,
  showPlaceholder = true,
  draggable,
  grabbing,
  ...props
}: TableDataProps): ReturnType<FC> => {
  return jsx(
    as,
    {
      ...(attributes || {}),
      css: [
        isEditable && editableStyles,
        tdBaseStyles,
        tdGridStyles,
        draggable && draggableStyles,
        grabbing && grabbingStyles,
        showPlaceholder && tdPlaceholderStyles,
      ],
      className,
      ...props,
    },
    children
  );
};
