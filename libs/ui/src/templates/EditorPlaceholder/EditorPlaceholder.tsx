import { css } from '@emotion/react';
import { FC } from 'react';
import { Divider, Placeholder } from '../../atoms';
import { ParagraphPlaceholder } from '../../molecules';
import { slimBlockWidth } from '../../styles/editor-layout';

const wrapperStyles = css({
  paddingTop: '24px',
  minWidth: `${slimBlockWidth}px`,
  margin: '0 auto',
});

const titleStyles = css({
  display: 'grid',
  height: '40px',
  marginBottom: '24px',
  maxWidth: '300px',
});

export const EditorPlaceholder = (): ReturnType<FC> => {
  return (
    <div css={wrapperStyles}>
      <div css={titleStyles}>
        <Placeholder />
      </div>
      <div role="presentation" css={{ marginBottom: '12px', display: 'grid' }}>
        <Divider />
      </div>
      <ParagraphPlaceholder />
    </div>
  );
};
