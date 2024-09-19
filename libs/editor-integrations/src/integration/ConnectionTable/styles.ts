import { cssVar, p13Medium, p14Medium } from '@decipad/ui';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
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
    'span:first-child': {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',

      svg: {
        flex: '0 0 auto',
        width: '16px',
        height: '16px',
      },

      span: {
        width: '100%',
        display: 'inline-flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'stretch',
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

export const StyledTable = styled.table(
  borderStyles,
  spacingStyles,
  generalStyles
);

export const TableWrapper = styled.div(noTrackScrollbarStyles, {
  width: `calc(${cssVar('editorWidth')} - 120px)`,
  overflowX: 'auto',
});

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
