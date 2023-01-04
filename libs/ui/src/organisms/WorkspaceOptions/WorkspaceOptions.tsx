import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { ComponentProps, FC } from 'react';
import { WorkspaceMenu } from '..';
import { Settings } from '../../icons';
import { p15Medium } from '../../primitives';
import { Anchor } from '../../utils';

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
  const activeWorkspaceRoute = workspaces({}).workspace({
    workspaceId: props.activeWorkspace.id,
  });
  return (
    <div
      css={{
        position: 'relative',
        display: 'flex',
        padding: '8px',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        justifyContent: 'space-between',
      }}
    >
      <strong css={nameStyles}>{props.activeWorkspace.name}</strong>
      <Anchor
        href={activeWorkspaceRoute.edit({}).$}
        css={css({ float: 'right', width: 16, height: 16 })}
      >
        <Settings />
      </Anchor>
    </div>
  );
};
