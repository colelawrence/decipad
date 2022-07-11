import React from 'react';
import { css } from '@emotion/react';
import { cssVar, shortAnimationDuration } from '../../../primitives';
import { editorLayout } from '../../../styles';

const blockStyles = css({
  display: 'grid',
  gridTemplateRows: '32px',
  gridTemplateColumns: `min(100%, ${editorLayout.slimBlockWidth}px)`,
  justifyContent: 'center',
  alignItems: 'center',

  borderRadius: '6px',
});

const iconWrapperStyles = css({
  width: '32px',
  height: '32px',
  display: 'grid',
  placeItems: 'center',
  borderRadius: '6px',
  backgroundColor: `${cssVar('highlightColor')}`,
  transition: `background-color ${shortAnimationDuration} ease-out`,
});

export const NotebookIconPlaceholder: React.FC = () => (
  <div css={blockStyles}>
    <div css={iconWrapperStyles} />
  </div>
);
