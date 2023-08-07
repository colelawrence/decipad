/* eslint decipad/css-prop-named-variable: 0 */
import { css } from '@emotion/react';
import { FC } from 'react';
import { editorLayout } from '../../../styles';
import { slimBlockWidth } from '../../../styles/editor-layout';
import { Divider } from '../../Divider/Divider';
import { Placeholder } from '../../Placeholder/Placeholder';
import { ParagraphPlaceholder } from '../ParagraphPlaceholder/ParagraphPlaceholder';

const wrapperStyles = css({
  paddingTop: '24px',
  minWidth: `${slimBlockWidth}px`,
  display: 'grid',
  gridTemplateColumns: `min(100%, ${editorLayout.slimBlockWidth}px)`,
  justifyContent: 'center',
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
