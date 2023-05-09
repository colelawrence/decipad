import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, p16Regular, setCssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

const placeholderStyles = css({
  cursor: 'text',

  // overlap content (blinking caret) and placeholder
  display: 'grid',
  '> span, label': {
    gridArea: '1 / 1',
  },

  label: {
    ...p16Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),

    pointerEvents: 'none',
    userSelect: 'none',
  },
});

const styles = css(blockAlignment.paragraph.typography, placeholderStyles, {
  wordBreak: 'break-word',
});

const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: `inset(0 -8px 0 -8px round 8px)`,
});

interface ParagraphProps {
  readonly children: ReactNode;
  /**
   * Note: Since this is not a plain-text element like an `<input>`,
   * it is up to the consumer to ensure the placeholder is removed
   * when there is content in the children that it could overlap with.
   */
  readonly placeholder?: JSX.Element | string;
}

export const Paragraph = ({
  children,
  placeholder,
}: ParagraphProps): ReturnType<React.FC> => {
  const isBlockActive = useIsBlockActive();

  return (
    <div
      aria-label="column-content"
      css={[styles, isBlockActive && activeStyles]}
      data-testid="paragraph-wrapper"
    >
      <label data-testid="paragraph-placeholder" contentEditable={false}>
        {placeholder}
      </label>
      <span data-testid="paragraph-content">{children}</span>
    </div>
  );
};
