import { css } from '@emotion/react';
import { gridTile } from '../../images';
import { cssVar } from '../../primitives';

export const backgroundStyles = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',

  height: '100%',
  width: '100%',
  background: `repeat url(${gridTile}), ${cssVar('highlightColor')}`,
});
