/* eslint decipad/css-prop-named-variable: 0 */
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { forwardRef, ReactNode } from 'react';
import { p16Regular } from '../../primitives';
import { blockAlignment } from '../../styles';

// Server as the base vertical space between elements. It's the same height as a 1-liner paragraph.
const defaultVerticalSpacing = `calc(${p16Regular.lineHeight})`;

// Here lies the main responsability of this block, to define the edge cases of spacings between
// different components.
const spacingStyles = css({
  paddingTop: defaultVerticalSpacing,
  // Headings
  '&[data-type^=heading] + *': {
    paddingTop: `calc(${defaultVerticalSpacing} / 2)`,
  },
  '&[data-type^=heading] + [data-type=divider] + *': {
    paddingTop: `calc(${defaultVerticalSpacing} / 2)`,
  },

  // Paragraphs
  '&[data-type=paragraph] + [data-type=list]': {
    paddingTop: `8px`,
  },

  // Live integrations
  '&[data-type=live] + *': {
    paddingTop: `40px`,
  },

  '&[data-type=live]': {
    paddingTop: `8px`,
  },

  // Lists
  '&[data-type=list] [data-type=list]': {
    paddingTop: 0,
  },

  // Code Lines
  '&[data-type=codeLine] + [data-type=codeLine]': {
    paddingTop: 0,
  },

  // Code Lines
  '&[data-type=structured] + [data-type=structured]': {
    paddingTop: 0,
  },

  // Tables
  '&[data-type$=Table]': {
    paddingTop: '40px',
  },
  '&[data-type$=Table] + *': {
    paddingTop: '40px',
  },

  // Columns
  '&[data-type$=columns]': {
    paddingTop: 0,
  },
});

const isHiddenStyles = css({
  display: 'none',
});

interface EditorBlockProps {
  readonly blockKind: keyof typeof blockAlignment;
  readonly children: ReactNode;
  readonly isHidden?: boolean;
  // This component is one of the main points of contact when integrating between editor and UI. As
  // such, we'll allow it to receive an arbitrary amount of props in order to facilitate said
  // integration.
  readonly [prop: string]: unknown;
}

export const EditorBlock: React.FC<EditorBlockProps> = forwardRef<
  HTMLDivElement,
  EditorBlockProps
>(({ blockKind, children, isHidden, ...props }, ref) => {
  const readOnly = useIsEditorReadOnly();
  return (
    <div
      {...props}
      css={[
        readOnly && isHidden && isHiddenStyles,
        {
          position: 'relative',
        },
        spacingStyles,
      ]}
      data-type={blockKind}
      ref={ref}
    >
      {children}
    </div>
  );
});
