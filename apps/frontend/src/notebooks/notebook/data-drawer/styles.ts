import { cssVar, p13Medium } from '@decipad/ui';
import styled from '@emotion/styled';

export const DataDrawerEditor = styled.div({
  display: 'flex',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  height: '32px',

  color: cssVar('textTitle'),

  '> div': {
    width: '100%',
  },
});

export const DataDrawerNameWrapper = styled.div({
  borderRadius: '8px',
  border: `1px solid ${cssVar('borderDefault')}`,

  flexBasis: '300px',

  display: 'flex',

  '> div:first-of-type': {
    border: `1px solid ${cssVar('borderDefault')}`,
    width: '100%',
    borderRadius: '8px',

    padding: '0px 8px',

    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    whiteSpace: 'pre',
  },

  '> div:last-of-type': {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',

    padding: '0px 8px',
  },
});

export const DataDrawerCodeWrapper = styled.div({
  borderRadius: '8px',
  border: `1px solid ${cssVar('borderDefault')}`,
  padding: '8px 12px',
  display: 'flex',

  '::before': {
    content: '"="',
    marginRight: '8px',
  },

  '> aside': {
    marginLeft: 'auto',
  },
});

export const FormulaUnitDrawer = styled.span(p13Medium, {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '2px',
  color: cssVar('themeTextSubdued'),
  svg: { width: '16px', height: '16px' },
  span: { display: 'inline-flex', alignItems: 'center' },
});

export const DataDrawerWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  height: '200px',

  '> div:first-of-type': {
    width: '100%',

    display: 'flex',
    alignItems: 'center',
  },

  '> footer:last-of-type': {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginTop: 'auto',
  },
});

export const DataDrawerCloseButton = styled.div({
  width: '24px',
  height: '24px',
  borderRadius: '8px',
  padding: '4px',
  marginLeft: 'auto',

  border: `1px solid ${cssVar('borderDefault')}`,
  backgroundColor: cssVar('backgroundAccent'),

  svg: {
    cursor: 'pointer',
    width: '100%',
    height: '100%',
  },
});
