import { css } from '@emotion/react';
import {
  cssVar,
  offBlack,
  offWhite,
  transparency,
  weakOpacity,
} from 'libs/ui/src/primitives';

export const wrapperStyles = css({
  background: cssVar('backgroundMain'),
  boxShadow: `0px 2px 24px -4px ${transparency(offBlack, weakOpacity).rgba}`,
  borderRadius: '6px',
  border: `1px solid ${offWhite.rgb}`,
  height: '48px',
  display: 'flex',
  alignItems: 'center',
  padding: '6px',
  zIndex: 2,
});
