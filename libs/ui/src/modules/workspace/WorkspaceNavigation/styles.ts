import styled from '@emotion/styled';
import {
  cssVar,
  easingTiming,
  p14Medium,
  transparencyHex,
} from '../../../primitives';

export const Container = styled.div({
  width: '100%',
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
});

type ItemWrapperProps = {
  isButton?: boolean;
};

export const ItemWrapper = styled.div<ItemWrapperProps>((props) => [
  {
    width: '100%',
    display: 'grid',
    justifyItems: 'flex-start',
    alignItems: 'center',
    gridTemplateColumns: '24px auto',
    padding: 6,
    gap: 2,
    color: props.isButton ? cssVar('textSubdued') : 'inherit',
  },
]);

type IconWrapperProps = {
  color?: string;
};

export const IconWrapper = styled.div<IconWrapperProps>((props) => [
  {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 3,

    '& > svg': {
      width: 18,
      height: 18,
    },
  },
  props.color && {
    color: props.color,
    '&[type="button"]': {
      cursor: 'pointer',

      borderRadius: 6,
      padding: 4,
      transition: `all 50ms ${easingTiming.easeIn}`,

      '&:hover': {
        transition: `all 150ms ${easingTiming.easeOut}`,
        backgroundColor: transparencyHex(props.color, 0.2),
      },
    },
  },
]);

export const TextWrapper = styled.span(p14Medium, {
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: 4,
  color: 'inherit',
  // some things about our font are just weird, you can't fix that
  paddingTop: 0.5,

  '& > svg': {
    width: 16,
    height: 16,
    color: cssVar('textSubdued'),
  },
});
