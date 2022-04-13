import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, display, setCssVar } from '../../primitives';
import { editorLayout } from '../../styles';

const placeholderStyles = css({
  cursor: 'text',

  // overlap content (blinking caret) and placeholder
  display: 'grid',
  '> span, ::before': {
    gridArea: '1 / 1',
  },

  '::before': {
    ...display,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),

    pointerEvents: 'none',

    content: 'attr(aria-placeholder)',
  },
});

const styles = css(display, placeholderStyles, {
  maxWidth: `${editorLayout.slimBlockWidth}px`,
  margin: 'auto',

  paddingTop: '28px',
});

interface DisplayProps {
  readonly children: ReactNode;
  readonly Heading: 'h1';
  /**
   * Note: Since this is not a plain-text element like an `<input>`,
   * it is up to the consumer to ensure the placeholder is removed
   * when there is content in the children that it could overlap with.
   */
  readonly placeholder?: string;
}

export const Display = ({
  children,
  Heading,
  placeholder,
}: DisplayProps): ReturnType<React.FC> => {
  return (
    <Heading aria-placeholder={placeholder} css={styles}>
      <span>{children}</span>
    </Heading>
  );
};
