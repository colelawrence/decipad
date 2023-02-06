import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { mobileQuery, smallScreenQuery } from '../../primitives';
import { editorLayout } from '../../styles';

const styles = css({
  padding: '0 32px',
  display: 'grid',
  gridTemplateColumns: '100%',
  alignContent: 'start',

  [mobileQuery]: {
    padding: '0 24px',
  },
});

const notebookStyles = css({
  order: 2,

  paddingTop: '72px',
  paddingBottom: '200px',

  display: 'grid',
  gridTemplateColumns: `minmax(100%, ${editorLayout.wideBlockWidth}px)`,
  justifyContent: 'center',
  [smallScreenQuery]: {
    paddingTop: '24px',
  },
});

const headerStyles = css({
  zIndex: 1,
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
