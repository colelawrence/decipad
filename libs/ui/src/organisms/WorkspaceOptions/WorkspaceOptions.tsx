import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { WorkspaceMenu } from '..';
import { p15Medium } from '../../primitives';

const nameStyles = css(p15Medium, {
  maxWidth: '200px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
});

type WorkspaceOptionsProps = ComponentProps<typeof WorkspaceMenu>;

export const WorkspaceOptions = (
  props: WorkspaceOptionsProps
): ReturnType<FC> => {
  return (
    <div css={{ position: 'relative', padding: '8px' }}>
      <strong css={nameStyles}>{props.activeWorkspace.name}</strong>
    </div>
  );
};
