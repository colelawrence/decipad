import { css } from '@emotion/react';
import { Placeholder } from '../../atoms';
import { notebookList } from '../../styles';
import { cssVar } from '../../primitives';

const verticalPadding = 3;

const { gridStyles } = notebookList;
const styles = css(gridStyles, {
  alignItems: 'end',
  padding: `${verticalPadding}px 0`,
});

const iconStyles = css({
  margin: `${-verticalPadding}px 0`,
  height: '32px',
  width: '32px',

  display: 'grid',
});
const titleStyles = css({
  alignSelf: 'center',
  overflowX: 'clip',
  textOverflow: 'ellipsis',

  display: 'grid',
  minWidth: '128px',
  minHeight: '20px',
});
const descriptionStyles = css({});
const middleAndRightStyles = css({
  gap: '8px',
  marginLeft: '36px',

  alignSelf: 'center',
  display: 'flex',
});

const tagStyle = css({
  display: 'flex',
  height: '20px',
  width: '60px',
  borderRadius: '4px',
  border: '1px solid',
  borderColor: cssVar('highlightColor'),
});

const seedRandom = (seed = 1) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const NotebookListItemPlaceholder: React.FC<{ pos?: number }> = ({
  pos,
}) => {
  const randomWidth = Math.floor(seedRandom(pos ?? 1) * 142 + 32);
  const tagsCount = Math.floor(seedRandom((pos ?? 1) + 10) * 2 + 1);

  return (
    <div role="presentation" css={styles}>
      <div css={[iconStyles, { gridArea: 'icon' }]}>
        <Placeholder />
      </div>
      <span
        css={[
          titleStyles,
          { gridArea: 'title / title / title / tags' },
          { width: `${randomWidth}px` },
        ]}
      >
        <Placeholder />
      </span>
      <div css={[descriptionStyles, { gridArea: 'description' }]}>
        <Placeholder />
      </div>
      <div css={[middleAndRightStyles, { gridArea: 'tags' }]}>
        {Array(tagsCount)
          .fill(null)
          .map((_, i) => (
            <span css={tagStyle} key={i} />
          ))}
      </div>
    </div>
  );
};
