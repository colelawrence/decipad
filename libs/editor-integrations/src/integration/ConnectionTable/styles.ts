import { cssVar, p13Medium, p14Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { noTrackScrollbarStyles } from 'libs/ui/src/styles/scrollbars';

const borderStyles = css({
  borderRadius: 8,
  border: `1px solid ${cssVar('borderDefault')}`,
  borderCollapse: 'separate',
  borderSpacing: 0,

  thead: {
    borderCollapse: 'separate',
    th: {
      borderBottom: `2px solid ${cssVar('borderDefault')}`,
    },
    'th:first-child': {
      borderTopLeftRadius: 8,
    },
    'th:last-child': {
      borderTopRightRadius: 8,
    },
  },

  'td:not(:last-child), th:not(:last-child)': {
    borderRight: `1px solid ${cssVar('borderDefault')}`,
  },

  tbody: {
    tr: {
      'tr, td': {
        borderBottom: `1px solid ${cssVar('borderDefault')}`,
      },
    },
  },
});

const spacingStyles = css({
  tableLayout: 'auto',

  'th, td': {
    padding: '4px 8px',
    height: '40px',
    verticalAlign: 'middle',
    whiteSpace: 'pre',
  },

  th: {
    // Icon + Title + Type Menu
    '> span:first-child': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',

      svg: {
        flex: '0 0 auto',
        width: '16px',
        height: '16px',
      },

      // Type menu
      'span:first-child': {
        width: '100%',
        display: 'inline-flex',
        justifyContent: 'end',

        svg: {
          cursor: 'pointer',
        },
      },
    },
  },
});

const generalStyles = css({
  th: p13Medium,
  td: p14Medium,

  thead: {
    backgroundColor: cssVar('backgroundSubdued'),
  },
});

const hiddenStyles = css({
  'th[data-hidden="true"]': {
    backgroundColor: cssVar('backgroundHeavier'),
  },
  'td[data-hidden="true"]': {
    backgroundColor: cssVar('backgroundDefault'),
  },
});

export const StyledTable = styled.table(
  borderStyles,
  spacingStyles,
  generalStyles,
  hiddenStyles
);

const buttonHoverStyles = css({
  ':hover': {
    '> div:last-child': {
      visibility: 'unset',
    },
  },

  '> div:last-child': {
    button: {
      minWidth: '32px',
      height: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },

    visibility: 'hidden',
    svg: { width: '16px' },
    borderRadius: '8px',
    backgroundColor: cssVar('backgroundDefault'),
  },
});

// TODO: add this to a common place.
const widthPadding = `calc((${slimBlockWidth}px - ${cssVar(
  'editorWidth'
)}) / -2)`;

export const TableWrapper = styled.div(
  noTrackScrollbarStyles,
  buttonHoverStyles,
  {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    paddingLeft: widthPadding,
    paddingRight: '16px',
  }
);

export const StyledFooter = styled.tfoot({
  backgroundColor: cssVar('backgroundSubdued'),

  tr: {
    td: {
      div: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      },
    },
  },
});

export const StyledInput = styled.input({
  backgroundColor: cssVar('backgroundAccent'),
  borderRadius: '8px',
  padding: '4px',
});
