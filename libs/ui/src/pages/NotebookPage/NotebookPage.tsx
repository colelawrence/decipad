import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { smallScreenQuery } from '../../primitives';
import { editorLayout } from '../../styles';

const styles = css({
  display: 'grid',
  gridTemplateColumns: '100%',
  alignContent: 'start',
});

const notebookStyles = css({
  order: 2,

  paddingTop: '100px',
  paddingBottom: '200px',

  display: 'grid',
  gridTemplateColumns: `minmax(100%, ${editorLayout.wideBlockWidth}px)`,
  justifyContent: 'center',
});

const headerStyles = css({
  zIndex: 2,
  [smallScreenQuery]: {
    margin: '0 -4px',
  },
});

interface NotebookPageProps {
  readonly topbar?: ReactNode;
  readonly notebookIcon: ReactNode;
  readonly notebook: ReactNode;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({
  topbar,
  notebookIcon,
  notebook,
}) => {
  return (
    <article css={styles}>
      <main css={notebookStyles}>
        {notebookIcon}
        {notebook}
      </main>
      {topbar && <header css={headerStyles}>{topbar}</header>}
    </article>
  );
};
