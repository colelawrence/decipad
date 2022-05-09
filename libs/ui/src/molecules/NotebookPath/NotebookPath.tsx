import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Slash } from '../../icons';
import {
  cssVar,
  p15Medium,
  setCssVar,
  smallestDesktop,
} from '../../primitives';
import { Anchor } from '../../utils';

const smallScreenQuery = `@media (max-width: ${smallestDesktop.portrait.width}px)`;

const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  [smallScreenQuery]: {
    display: 'none',
  },
});

const workspaceNameStyles = css(p15Medium, {
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  marginLeft: '0.5rem',
});

const notebookNameStyles = css(p15Medium, {
  color: cssVar('currentTextColor'),
  cursor: 'default',
});

const iconStyles = css({
  flexShrink: 0,

  width: '12px',
  height: '12px',
  display: 'inline-block',
  marginBottom: '6px',
});

interface NotebookPathProps {
  isAdmin: boolean;
  notebookName: string;
  workspace: { id: string; name: string };
}

export const NotebookPath = ({
  isAdmin,
  workspace,
  notebookName,
}: NotebookPathProps): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      {isAdmin && (
        <>
          <Anchor
            href={workspaces({}).workspace({ workspaceId: workspace.id }).$}
            css={workspaceNameStyles}
          >
            {workspace.name}
          </Anchor>
          <div css={iconStyles}>
            <Slash />
          </div>
        </>
      )}

      <em css={notebookNameStyles}>{notebookName || '<unnamed-notebook>'}</em>
    </div>
  );
};
