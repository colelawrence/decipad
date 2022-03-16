import { useIsBlockActive } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, p16Regular, setCssVar } from '../../primitives';
import { blockAlignment } from '../../styles';

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

const styles = css(blockAlignment.paragraph.typography, placeholderStyles, {
  padding: `${blockAlignment.paragraph.paddingTop} 0`,
});

const verticalClipInset = `calc(${blockAlignment.paragraph.paddingTop} * 0.75)`;
const activeStyles = css({
  backgroundColor: cssVar('highlightColor'),
  boxShadow: `0px 0px 0px 100vmin ${cssVar('highlightColor')}`,
  clipPath: `inset(${verticalClipInset} -8px ${verticalClipInset} -8px round 8px)`,
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
  const isBlockActive = useIsBlockActive();

  return (
    <p
      aria-placeholder={placeholder}
      css={[styles, isBlockActive && activeStyles]}
    >
      <span>{children}</span>
    </p>
  );
};
