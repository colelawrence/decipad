import { Remark } from 'react-remark';
import { code, cssVar, p14Bold, p14Regular } from '../../primitives';
import { css } from '@emotion/react';

const contentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',

  'h1, h2, h3, h4, h5, h6': {
    ...p14Bold,
    margin: 0,
    padding: 6,
  },

  p: {
    padding: 6,
    margin: 0,
  },

  em: {
    fontStyle: 'italic',
  },

  strong: {
    fontWeight: 'bold',
  },

  pre: {
    ...code,
    padding: 6,
    margin: '6px 0px',
    width: '100%',
    backgroundColor: cssVar('backgroundHeavy'),
    boxShadow: `0px 1px 0px 1px ${cssVar('borderDefault')}`,
    borderRadius: 8,
    color: cssVar('textHeavy'),

    '& > code': {
      padding: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
  },

  code: {
    ...code,
    padding: '0.5px 4px 1.5px',
    backgroundColor: cssVar('backgroundHeavy'),
    borderRadius: 4,
    color: cssVar('textHeavy'),
  },

  'ul, ol': {
    margin: 0,
    padding: '0px 0px 0px 20px',

    '& li': {
      margin: '6px 12px',
    },
  },

  ul: {
    listStyle: 'disc',
  },

  ol: {
    listStyle: 'decimal',
  },
});

type Props = {
  readonly content: string;
};

export const ChatMarkdownRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div css={contentStyles} data-testid="ai-chat-message">
      <Remark>{content}</Remark>
    </div>
  );
};
