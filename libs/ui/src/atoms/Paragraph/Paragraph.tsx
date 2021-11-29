import { css } from '@emotion/react';
import { ReactNode } from 'react';
import { cssVar, p16Regular, setCssVar } from '../../primitives';
import { SlateElementProps } from '../../utils';

const placeholderStyles = css({
  position: 'relative',

  '::before': {
    ...p16Regular,
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    cursor: 'text',
    pointerEvents: 'none',

    position: 'absolute',

    content: 'attr(aria-placeholder)',
  },
});

const styles = css(p16Regular, placeholderStyles, {
  padding: '6px 0',
});

interface ParagraphProps extends SlateElementProps {
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
  slateAttrs,
}: ParagraphProps): ReturnType<React.FC> => {
  return (
    <p aria-placeholder={placeholder} css={styles} {...slateAttrs}>
      {children}
    </p>
  );
};
