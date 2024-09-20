import styled from '@emotion/styled';
import {
  cssVar,
  easingTiming,
  p14Bold,
  p14Medium,
  p12Medium,
  transparencyHex,
  componentCssVars,
} from '../../primitives';
import { deciOverflowYStyles } from '../../styles/scrollbars';

type NotebookWrapperProps = {
  isSelected?: boolean;
};

type ItemWrapperProps = {
  isButton?: boolean;
  marginLeft?: number;
  isSelected?: boolean;
};

export const NavigationSidebarWrapperStyles = styled.div(
  {
    position: 'relative',
    overflowX: 'hidden',
    width: 320,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 24,
  },
  deciOverflowYStyles
);

export const Container = styled.div({
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

export const TooltipText = styled.p(p12Medium, {
  color: componentCssVars('TooltipText'),
});

export const NotebookOptionsWrapper = styled.div({
  '& svg': {
    width: '16px',
  },
});

export const NotebookWrapper = styled.div<NotebookWrapperProps>((props) => [
  {
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    cursor: 'pointer',
    '&:hover, &:focus': {
      backgroundColor: cssVar('backgroundHeavy'),
      borderRadius: '6px',
    },
  },
  props.isSelected && {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: '6px',
  },
]);

export const ItemWrapper = styled.div<ItemWrapperProps>((props) => [
  {
    width: '100%',
    display: 'flex',
    justifyItems: 'flex-start',
    alignItems: 'center',
    gridTemplateColumns: '24px auto',
    padding: 6,
    gap: 4,
    color: props.isButton ? cssVar('textSubdued') : 'inherit',

    '&:active': {
      transform: 'scale(0.98)',
      transition: `all 150ms ${easingTiming.easeOut}`,
    },
  },
  props.marginLeft && {
    marginLeft: props.marginLeft,
  },
  props.isSelected && {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: '6px',
  },
]);

type IconWrapperProps = {
  color?: string;
};

export const AddButtonWrapper = styled.div({
  '& > [role="button"]:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: '6px',
  },
});

export const IconWrapper = styled.div<IconWrapperProps>((props) => [
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 3,

    '& svg': {
      width: 16,
      height: 16,
    },
  },
  props.color && {
    color: props.color,
    filter: 'brightness(0.7)',
    '&[type="button"]': {
      cursor: 'pointer',
      borderRadius: 6,
      padding: 4,
      transition: `all 50ms ${easingTiming.easeIn}`,

      '&:hover': {
        backgroundColor: transparencyHex(props.color, 0.2),
      },
    },
  },
]);

export const TextWrapper = styled.p(p14Medium, {
  lineHeight: 1,
  display: 'inline-block',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 4,
  color: 'inherit',
  // some things about our font are just weird, you can't fix that
  paddingTop: 0.5,
  textOverflow: 'ellipsis',
  // this is needed to make the text overflow work
  maxWidth: '164px',
  whiteSpace: 'nowrap',
  // just in case...
  overflow: 'hidden',

  '& > svg': {
    width: 16,
    height: 16,
    color: cssVar('textSubdued'),
  },
});

export const NavigationTitleWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
});

export const NavigationTitle = styled.div([
  p14Bold,
  {
    color: cssVar('textHeavy'),
    lineHeight: '30px',
    flexShrink: 0,
    paddingBottom: 8,
  },
]);

export const EllipsisWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  // to center vertically the ellipsis
  height: '36px',
});

export const UnsectionedNotebooksWrapper = styled.div({
  width: '100%',
  overflowY: 'auto',
  maxHeight: '220px',
});
