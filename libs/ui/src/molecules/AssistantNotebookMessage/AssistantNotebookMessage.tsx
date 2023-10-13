/* eslint decipad/css-prop-named-variable: 0 */

import { css } from '@emotion/react';
import { cssVar, p14Medium } from '../../primitives';
import { Sparkles } from '../../icons';

const wrapperStyles = css({
  display: 'flex',
  padding: '8px',
  marginLeft: 8,
  gap: 2,
});

const iconStyles = css({
  width: 24,
  height: 24,
  flexShrink: 0,

  svg: {
    width: 20,
    height: 20,

    path: {
      stroke: cssVar('textSubdued'),
    },
  },
});

const contentStyles = css(p14Medium, {
  width: '100%',
  lineHeight: '20px',
  color: cssVar('textSubdued'),
  margin: 0,
  padding: 0,
});

type AssistantNotebookMessageProps = {
  readonly text: string;
};

export const AssistantNotebookMessage: React.FC<
  AssistantNotebookMessageProps
> = ({ text }) => {
  return (
    <div css={wrapperStyles}>
      <div css={iconStyles}>
        <Sparkles />
      </div>
      <p css={contentStyles}>{text}</p>
    </div>
  );
};
