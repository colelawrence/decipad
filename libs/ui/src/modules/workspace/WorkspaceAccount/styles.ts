import styled from '@emotion/styled';
import {
  cssVar,
  easingTiming,
  p13Bold,
  p13Medium,
} from 'libs/ui/src/primitives';

export const ItemWrapper = styled.button({
  display: 'grid',
  gridTemplateColumns: '28px auto 28px',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  transition: `all 50ms ${easingTiming.easeIn}`,

  '&:hover, &:focus': {
    transition: `all 150ms ${easingTiming.easeOut}`,
  },

  '&:active': {
    transform: 'scale(0.98)',

    transition: `all 150ms ${easingTiming.easeOut}`,
  },
});

export const AvatarWrapper = styled.div({
  height: '28px',
  width: '28px',
  overflow: 'hidden',
});

export const Details = styled.div({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
});

export const Title = styled.p(p13Bold, {
  color: cssVar('textDefault'),
});

export const Subtitle = styled.p(p13Medium, {
  color: cssVar('textSubdued'),
});

export const IconWrapper = styled.div({
  height: '28px',
  width: '28px',
  borderRadius: '8px',
  padding: '4px',
  backgroundColor: cssVar('backgroundDefault'),
  cursor: 'pointer',
  opacity: 0.6,

  '& > svg': {
    width: '20px',
    height: '20px',
    '& > path': {
      fill: cssVar('textSubdued'),
      stroke: cssVar('textSubdued'),
    },
  },
});
