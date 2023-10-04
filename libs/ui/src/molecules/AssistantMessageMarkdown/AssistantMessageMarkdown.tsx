import { Remark } from 'react-remark';
import { code, componentCssVars, p14Regular, p16Bold } from '../../primitives';
import { css } from '@emotion/react';

const contentStyles = css(p14Regular, {
  position: 'relative',
  width: '100%',
  color: componentCssVars('AIAssistantTextColor'),

  'h1, h2, h3, h4, h5, h6': {
    ...p16Bold,
    margin: 0,
    padding: 6,
    color: componentCssVars('AIAssistantTextColor'),
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
    margin: 0,
    width: '100%',
    backgroundColor: componentCssVars('AIAssistantCodeBackgroundColor'),
    borderRadius: 8,
    color: componentCssVars('AIAssistantHighlightColor'),

    '& > code': {
      padding: 0,
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
    },
  },

  code: {
    ...code,
    padding: '0.5px 4px 1.5px',
    backgroundColor: componentCssVars('AIAssistantCodeBackgroundColor'),
    borderRadius: 4,
    color: componentCssVars('AIAssistantHighlightColor'),
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

type AssistantMessageMarkdownProps = {
  readonly text: string;
};

export const AssistantMessageMarkdown: React.FC<
  AssistantMessageMarkdownProps
> = ({ text }) => {
  return (
    <div css={contentStyles}>
      <Remark>{text}</Remark>
    </div>
  );
};
