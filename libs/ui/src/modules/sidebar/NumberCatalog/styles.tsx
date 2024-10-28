import styled from '@emotion/styled';
import { cssVar, easingTiming, transparencyHex } from '../../../primitives';

type IconWrapperProps = {
  color?: string;
};

type IconOuterWrapperProps = {
  highlightBackgroundOnHover?: boolean;
};

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
