import styled from '@emotion/styled';
import {
  componentCssVars,
  cssVar,
  p13Medium,
  tinyPhone,
} from '../../primitives';

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
  display: 'flex',
  height: '100%',
  gap: '8px',
  div: {
    backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
    borderRadius: '6px',
    height: '100%',
    display: 'flex',
  },
  button: {
    padding: '8px',
    borderRadius: '6px',
    backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
    ':not(:disabled):hover': {
      backgroundColor: componentCssVars('ButtonTertiaryAltHoverBackground'),
    },
  },
  'button:last-of-type': {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  svg: {
    width: '16px',
    height: '16px',
  },
});

export const Status = styled.div(p13Medium, {
  cursor: 'default',
  userSelect: 'none',
});

export const MenuItemButton = styled.div(p13Medium, {
  cursor: 'pointer',
  userSelect: 'none',
  'div em': {
    cursor: 'pointer',
    userSelect: 'none',
  },
});

export const GPTAuthorContainer = styled.div(p13Medium, {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',

  '& > p': {
    color: cssVar('textSubdued'),
    paddingTop: 1,

    [tinyPhone]: {
      display: 'none',
    },
  },
});

export const GPTIcon = styled.div({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px',
  height: 32,
  width: 32,
  backgroundColor: cssVar('backgroundMain'),
  borderRadius: 8,
  border: `1px solid ${cssVar('borderDefault')}`,
  svg: {
    width: '16px',
    height: '16px',
  },
});

export const GPTNotification = styled.div(p13Medium, {
  position: 'absolute',
  left: '50%',
  transform: 'translateX(-50%)',
  bottom: '-32px',
  width: '100%',
  maxWidth: '580px',
  height: 32,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  padding: '0px 12px',
  backgroundColor: cssVar('stateNeutralBackground'),
  color: cssVar('stateNeutralText'),
  borderRadius: '0 0 8px 8px',

  '& > p > a': {
    textDecoration: 'underline',

    '& > span': {
      display: 'inline',
    },
  },

  [tinyPhone]: {
    height: 56,
    bottom: '-56px',
  },
});
