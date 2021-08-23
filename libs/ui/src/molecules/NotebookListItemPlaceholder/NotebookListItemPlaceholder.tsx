import { css } from '@emotion/react';
import { FC } from 'react';
import { Placeholder } from '../../atoms';
import { notebookList } from '../../styles';

const verticalPadding = 3;

const { gridStyles } = notebookList;
const styles = css(gridStyles, {
  alignItems: 'end',
  padding: `${verticalPadding}px 0`,
});

const iconStyles = css({
  margin: `${-verticalPadding}px 0`,
  height: '38px',

  display: 'grid',
});
const titleStyles = css({
  height: '12px',
  maxWidth: `${(100 * 124) / 506}%`,

  display: 'grid',
});
const descriptionStyles = css({
  height: '12px',
  maxWidth: `${(100 * 440) / 506}%`,

  display: 'grid',
});
const middleAndRightStyles = css({
  height: '12px',
  maxWidth: '64px',

  display: 'grid',
});

export const NotebookListItemPlaceholder = (): ReturnType<FC> => {
  return (
    <div role="presentation" css={styles}>
      <div css={[iconStyles, { gridArea: 'icon' }]}>
        <Placeholder />
      </div>
      <div css={[titleStyles, { gridArea: 'title' }]}>
        <Placeholder />
      </div>
      <div css={[descriptionStyles, { gridArea: 'description' }]}>
        <Placeholder />
      </div>
      <div css={[middleAndRightStyles, { gridArea: 'updated' }]}>
        <Placeholder />
      </div>
      <div css={[middleAndRightStyles, { gridArea: 'emptycol' }]}>
        <Placeholder />
      </div>
    </div>
  );
};
