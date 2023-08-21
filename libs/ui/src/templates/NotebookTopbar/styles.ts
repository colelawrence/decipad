import styled from '@emotion/styled';
import { componentCssVars, cssVar, p13Medium } from '../../primitives';

export const IconWrap = styled.div({
  width: '32px',
  height: '32px',

  display: 'grid',
});

export const TitleContainer = styled.div({
  display: 'flex',
  // To make the items overlap slightly.
  gap: '-6px',
  backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  borderRadius: '6px',
  color: cssVar('textDefault'),
  height: '100%',
  textTransform: 'capitalize',

  'div:nth-of-type(1)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0px 4px 0px 4px',
    svg: {
      width: '16px',
      height: '16px',
    },
  },
  'div:nth-of-type(2)': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0px 8px',
    gap: '4px',
    borderRadius: '6px',
    outline: `2px solid ${cssVar('backgroundAccent')}`,
  },
});

export const LeftContainer = styled.div({
  height: '32px',
  display: 'flex',
  gap: '8px',
});

export const ActionButtons = styled.div({
  backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  borderRadius: '6px',
  display: 'flex',
  button: {
    padding: '8px',
    borderRadius: '6px',
    ':not(:disabled):hover': {
      backgroundColor: componentCssVars('ButtonTertiaryAltHoverBackground'),
    },
  },
  svg: {
    width: '16px',
    height: '16px',
  },
});

export const Status = styled.div(p13Medium, {
  cursor: 'pointer',
});

export const BetaWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
});
