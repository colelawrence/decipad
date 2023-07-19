import { CSSObject, css } from '@emotion/react';
import { cssVar } from '../primitives';

export const styles: CSSObject = {
  backgroundColor: cssVar('backgroundColor'),
  border: `1px solid ${cssVar('borderColor')}`,
  borderRadius: '8px',
};

export const RainbowText = css({
  background: `linear-gradient(268.09deg, #C1FA6B -0.35%, #A9FF28 -0.34%, #E9C711 85.21%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
});
