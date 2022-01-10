import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, p16Regular, setCssVar } from '../../primitives';

const placeholderStyles = css({
  cursor: 'text',

  // overlap content (blinking caret) and placeholder
  display: 'grid',
  '> span, ::before': {
    gridArea: '1 / 1',
  },

  '::before': {
    ...p16Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),

    pointerEvents: 'none',

    content: 'attr(aria-placeholder)',
  },
});

const styles = css(p16Regular, placeholderStyles, {
  padding: '6px 0',
});

interface ParagraphProps {
  readonly children: ReactNode;
  /**
   * Note: Since this is not a plain-text element like an `<input>`,
   * it is up to the consumer to ensure the placeholder is removed
   * when there is content in the children that it could overlap with.
   */
  readonly placeholder?: string;
}

export const Paragraph = ({
  children,
  placeholder,
}: ParagraphProps): ReturnType<React.FC> => {
  return (
    <p aria-placeholder={placeholder} css={styles}>
      <span>{children}</span>
    </p>
  );
};
