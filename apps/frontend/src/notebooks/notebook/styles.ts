import styled from '@emotion/styled';

export const WorkspaceNumbersWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  paddingTop: 8,
  paddingLeft: 8,

  svg: {
    width: '16px',
    height: '16px',
  },

  '> ul': {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },

  li: {
    span: {
      cursor: 'pointer',
    },

    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',

    height: '32px',

    '> span:last-of-type': {
      display: 'flex',
      gap: '4px',
    },
  },
});
