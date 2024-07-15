import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { hideOnPrint, slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import {
  componentCssVars,
  cssVar,
  p12Bold,
  p12Regular,
  p13Medium,
  smallScreenQuery,
  tinyPhone,
} from '../../../primitives';
import { closeButtonStyles } from '../../../styles/buttons';
import { deciOverflowXStyles } from '../../../styles/scrollbars';

const genericTopbarStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  rowGap: '8px',
  width: '100%',
  height: '100%',

  [smallScreenQuery]: {
    padding: 0,

    '& > div': {
      width: 'auto',
      minWidth: '100%',
    },
  },
});

export const DefaultTopbarWrapper = styled.div(
  hideOnPrint,
  deciOverflowXStyles,
  genericTopbarStyles,
  hideOnPrint,
  {
    padding: '16px 0',
  }
);

export const EmbedTopbarWrapper = styled.div(deciOverflowXStyles, {
  padding: '0',
});

export const InnerStyles = styled.div({
  width: '100%',
  height: '32px',
  gap: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
});

export const IconWrap = styled.div({
  width: '32px',
  height: '32px',

  display: 'grid',

  '& > svg': {
    color: cssVar('textDefault'),

    '&:hover': {
      color: cssVar('textDefault'),
    },
  },
});

export const EllipsisButtonContainer = styled.div({
  display: 'flex',
  backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  borderRadius: '6px',
  color: cssVar('textDefault'),
  height: '100%',
  padding: '5px',
  div: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    svg: {
      width: '20px',
      height: '20px',
    },
  },
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

export const AiContainer = styled.div({
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

export const RightContainer = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5em',
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
    color: componentCssVars('ButtonTertiaryAltDefaultText'),
    ':not(:disabled):hover': {
      backgroundColor: componentCssVars('ButtonTertiaryAltHoverBackground'),
      color: componentCssVars('ButtonTertiaryAltHoverText'),
    },
    '&:disabled': {
      backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
      color: componentCssVars('ButtonTertiaryAltDisabledText'),
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
  maxWidth: `${slimBlockWidth}px`,
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

const hideForSmallScreenStyles = css({
  [smallScreenQuery]: {
    display: 'none',
  },
});

export const HiddenFromSmallScreens = styled.div(hideForSmallScreenStyles);

export const TemplateWrapper = styled.div(hideForSmallScreenStyles, {
  backgroundColor: componentCssVars('ButtonTertiaryAltDefaultBackground'),
  color: componentCssVars('ButtonTertiaryAltDefaultText'),
  display: 'flex',
  gap: '12px',
  height: '32px',
  ':hover': {
    backgroundColor: componentCssVars('ButtonTertiaryAltHoverBackground'),
    color: componentCssVars('ButtonTertiaryAltHoverText'),
  },
  borderRadius: 6,
  justifyContent: 'center',
  alignItems: 'center',
  padding: '8px',
});

export const TemplatesText = styled.span({
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  gap: '8px',
  alignItems: 'center',
  userSelect: 'none',
  color: cssVar('textHeavy'),

  svg: {
    display: 'grid',
    width: '16px',
    height: '16px',
  },
});

export const AuthorsWrapper = styled.div(p13Medium, {
  color: cssVar('textSubdued'),
  display: 'flex',
});

export const AuthorsTrigger = styled.span({
  cursor: 'pointer',
  width: 16,
  height: 16,
  ':hover': {
    ...closeButtonStyles,
  },
});

export const SpanTinyPhoneHide = styled.span({
  alignSelf: 'flex-end',
  [tinyPhone]: {
    display: 'none',
  },
});

export const SidebarToggleTrigger = styled.div({
  width: '20px',
  height: '20px',
});

export const HideSmallScreen = styled.div({
  [smallScreenQuery]: {
    display: 'none',
  },
});

export const ReadOnlyWritingTrigger = styled.div({
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  svg: {
    width: '20px',
    height: '20px',
  },
  [smallScreenQuery]: {
    display: 'none',
  },
});

export const ReadOnlyWritingWrapper = styled.div({
  display: 'flex',
  flexDirection: 'column',
  width: '128px',
  p: {
    textAlign: 'center',
  },
  'p:first-of-type': {
    ...p12Bold,
    color: componentCssVars('TooltipText'),
  },
  'p:last-of-type': {
    ...p12Regular,
    color: componentCssVars('TooltipText'),
  },
});
