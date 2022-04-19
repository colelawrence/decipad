import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { wideBlockWidth } from '../../styles/editor-layout';

const styles = css({
  padding: '0 32px',
  display: 'grid',
});

const notebookStyles = css({
  order: 2,

  paddingTop: '72px',
  paddingBottom: '200px',

  display: 'grid',
  gridTemplateColumns: `minmax(100%, ${wideBlockWidth}px)`,
  justifyContent: 'center',
});

interface NotebookPageProps {
  readonly topbar?: ReactNode;
  readonly notebook: ReactNode;
}

export const NotebookPage: React.FC<NotebookPageProps> = ({
  topbar,
  notebook,
}) => {
  return (
    <article css={styles}>
      <main css={notebookStyles}>{notebook}</main>
      {topbar && <header>{topbar}</header>}
    </article>
  );
};
