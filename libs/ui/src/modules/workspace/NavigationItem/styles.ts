import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { cssVar, easingTiming } from 'libs/ui/src/primitives';
import { Anchor } from 'libs/ui/src/utils';
import { ComponentProps } from 'react';

export const CollapsibleContainer = styled.div({
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: 4,
});

export const activeItemStyles = css({
  backgroundColor: cssVar('backgroundHeavy'),
  color: cssVar('textHeavy'),
});

export const baseItemStyles = css({
  position: 'relative',
  width: '100%',
  display: 'grid',
  cursor: 'pointer',

  borderRadius: 8,
  color: cssVar('textDefault'),
  transition: `all 50ms ${easingTiming.easeIn}`,

  '&:hover, &:focus': {
    backgroundColor: cssVar('backgroundHeavy'),
    transition: `all 150ms ${easingTiming.easeOut}`,
  },

  '&:active': {
    backgroundColor: cssVar('backgroundHeavy'),
    color: cssVar('textHeavy'),
    transform: 'scale(0.98)',

    transition: `all 150ms ${easingTiming.easeOut}`,
  },

  '&:focus-visible': {
    boxShadow: `0 0 0 2px ${cssVar('focusOutline')}`,
  },
});

type ButtonProps = {
  level: number;
  isActive?: boolean;
};

export const ItemButton = styled.button<ButtonProps>((props) => [
  {
    ...baseItemStyles,
  },
  props.level && {
    paddingLeft: props.level * 20,
  },
  props.isActive && {
    ...activeItemStyles,
  },
]);

export const ItemAnchor = styled(Anchor)<
  ButtonProps & ComponentProps<typeof Anchor>
>((props) => [
  {
    ...baseItemStyles,
  },
  props.level && {
    paddingLeft: props.level * 20,
  },
]);

export const CollapsibleIcon = styled.div({
  position: 'absolute',
  right: 2,
  top: 2,
  bottom: 2,

  width: 32,
  height: 32,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 8,

  '& > svg': {
    height: 16,
    width: 16,
  },
});
