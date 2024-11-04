import styled from '@emotion/styled';
import {
  cssVar,
  easingTiming,
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

type IconWrapperProps = {
  color?: string;
};

type IconOuterWrapperProps = {
  highlightBackgroundOnHover?: boolean;
};

type TextWrapperProps = {
  isSelected?: boolean;
  isNested?: boolean;
};

export const NavigationSidebarWrapperStyles = styled.div(
  {
    // small hack to avoid the marginRight: 24px coming from parent components.
    // TODO: unify all margins and sidebars
    marginRight: '-8px',
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
  paddingRight: '6px',
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
    padding: '4px',
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

export const AddButtonWrapper = styled.div({
  '& > [role="button"]:hover': {
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: '6px',
  },
});

export const IconOuterWrapper = styled.div<IconOuterWrapperProps>((props) => [
  {
    color: cssVar('textDisabled'),
    ':hover': {
      color: cssVar('textHeavy'),
    },
  },
  props.highlightBackgroundOnHover && {
    ':hover': {
      backgroundColor: cssVar('backgroundHeavy'),
      borderRadius: '6px',
    },
  },
]);

export const IconWrapper = styled.div<IconWrapperProps>((props) => [
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
    width: '24px',

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

export const TextWrapper = styled.p<TextWrapperProps>((props) => [
  p14Medium,
  {
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
    maxWidth: props.isNested ? '110px' : '130px',
    whiteSpace: 'nowrap',
    // just in case...
    overflow: 'hidden',

    '& > svg': {
      width: 16,
      height: 16,
      color: cssVar('textSubdued'),
    },
  },
  props.isSelected && {
    color: cssVar('textTitle'),
  },
]);

export const NavigationTitleInnerWrapper = styled.div({
  display: 'flex',
  cursor: 'pointer',
});

export const NavigationTitleWrapper = styled.div({
  display: 'flex',
  justifyContent: 'space-between',
  paddingTop: '8px',
  paddingBottom: '8px',
  alignItems: 'center',
  backgroundColor: cssVar('backgroundDefault'),
  position: 'fixed',
  width: '225px',
  zIndex: '2',
});

export const NavigationTitle = styled.p([
  p14Medium,
  {
    lineHeight: '24px',
    flexShrink: 0,
    display: 'inline',
  },
]);

export const EllipsisWrapper = styled.div({
  display: 'flex',
  alignItems: 'center',
  // to center vertically the ellipsis
  height: '36px',
});

export const SectionListWrapper = styled.div(deciOverflowYStyles, {
  overflow: 'auto !important',
});

// Drag and Drop
export const DragDropWrapper = styled.div({
  backgroundColor: cssVar('backgroundDefault'),
  opacity: 1,
  color: cssVar('textDefault'),
  padding: 6,
  borderRadius: 6,
  display: 'inline-flex',
  gap: 4,
  zIndex: 1000,
  transform: 'rotate(3deg)',
});

export const DragDropIcon = styled.span({
  height: 16,
  width: 16,
  alignItems: 'center',
  justifyContent: 'center',
});

export const DragDropTitle = styled.span({
  alignItems: 'center',
  justifyContent: 'center',
  color: cssVar('textTitle'),
});

export const ListWrapper = styled.div({
  marginTop: '40px',
});
