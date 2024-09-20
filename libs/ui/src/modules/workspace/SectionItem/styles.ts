import { OpaqueColor } from '@decipad/utils';
import styled from '@emotion/styled';
import { cssVar, easingTiming } from 'libs/ui/src/primitives';

type ItemWrapperProps = {
  color: string | OpaqueColor;
  hasChildren?: boolean;
};

export const ItemWrapper = styled.div<ItemWrapperProps>((props) => [
  {
    width: '100%',
    display: 'grid',
    alignItems: 'center',
    paddingRight: 6,
    borderRadius: 8,
    color: cssVar('textDefault'),
    transition: `all 50ms ${easingTiming.easeIn}`,
    '&:focus-visible': {
      boxShadow: `0 0 0 2px ${cssVar('focusOutline')}`,
    },
  },
  !props.hasChildren && {
    gridTemplateColumns: 'auto 24px',
    '&:hover, &:focus': {
      backgroundColor: props.color,
      transition: `all 150ms ${easingTiming.easeOut}`,
    },
    '&:active': {
      transform: 'scale(0.98)',
      transition: `all 150ms ${easingTiming.easeOut}`,
    },
  },
]);
