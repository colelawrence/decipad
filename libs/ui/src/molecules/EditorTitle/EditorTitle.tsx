/* eslint-disable jsx-a11y/role-supports-aria-props */

import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { Divider } from '../../atoms';
import { cssVar, display } from '../../primitives';

interface EditorTitleProps {
  readonly children: ReactNode;
  /**
   * Note: Since this is not a plain-text element like an `<input>`,
   * it is up to the consumer to ensure the placeholder is removed
   * when there is content in the children that it could overlap with.
   */
  readonly placeholder?: string;
}

export const EditorTitle: FC<EditorTitleProps> = ({
  children,
  placeholder,
}) => (
  <div css={wrapperStyles}>
    <div>
      <h1
        role="textbox"
        aria-placeholder={placeholder}
        data-testid="editor-title"
      >
        {children}
      </h1>
    </div>
    <div contentEditable={false}>
      <Divider />
    </div>
  </div>
);

const wrapperStyles = css({
  display: 'grid',
  rowGap: '24px',
  h1: css(display, {
    cursor: 'text',
    display: 'grid',
    wordBreak: 'break-word',
    '> span, ::before': {
      gridArea: '1 / 1',
    },

    '::before': {
      ...display,
      color: cssVar('textSubdued'),
      pointerEvents: 'none',
      content: 'attr(aria-placeholder)',
    },
  }),
});
