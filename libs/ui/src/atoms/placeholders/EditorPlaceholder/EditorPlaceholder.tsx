import { css } from '@emotion/react';
import { FC } from 'react';
import { slimBlockWidth } from '../../../styles/editor-layout';
import { Divider } from '../../Divider/Divider';
import { Placeholder } from '../../Placeholder/Placeholder';
import { ParagraphPlaceholder } from '../ParagraphPlaceholder/ParagraphPlaceholder';

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
