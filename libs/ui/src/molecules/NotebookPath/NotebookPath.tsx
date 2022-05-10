import { workspaces } from '@decipad/routing';
import { css } from '@emotion/react';
import { FC } from 'react';
import { Slash } from '../../icons';
import { cssVar, p15Medium, setCssVar } from '../../primitives';
import { Anchor } from '../../utils';

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
  isWriter: boolean;
  notebookName: string;
  workspace: { id: string; name: string };
}

export const NotebookPath = ({
  isWriter,
  workspace,
  notebookName,
}: NotebookPathProps): ReturnType<FC> => {
  return (
    <div css={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {isWriter && (
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
