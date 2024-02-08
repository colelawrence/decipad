import { OpaqueColor } from '@decipad/utils';
import styled from '@emotion/styled';
import { cssVar, easingTiming } from 'libs/ui/src/primitives';

type ItemWrapperProps = {
  color: string | OpaqueColor;
};

export const ItemWrapper = styled.div<ItemWrapperProps>((props) => [
  {
    width: '100%',
    display: 'grid',
    alignItems: 'center',
    gridTemplateColumns: 'auto 24px',
    paddingLeft: 20,
    paddingRight: 6,
    borderRadius: 8,
    color: cssVar('textDefault'),
    transition: `all 50ms ${easingTiming.easeIn}`,

    '&:hover, &:focus': {
      backgroundColor: props.color,
      transition: `all 150ms ${easingTiming.easeOut}`,
    },

    '&:active': {
      transform: 'scale(0.98)',
      transition: `all 150ms ${easingTiming.easeOut}`,
    },

    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${cssVar('focusOutline')}`,
    },
  },
]);
