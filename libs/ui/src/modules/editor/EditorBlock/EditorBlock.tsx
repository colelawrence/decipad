/* eslint decipad/css-prop-named-variable: 0 */
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { hideOnPrint, slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import { forwardRef, ReactNode } from 'react';
import { cssVar, p16Regular } from '../../../primitives';
import { blockAlignment } from '../../../styles';

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

  // Layout

  // Remove paddingTop on layout element
  // '&[data-type$=layout]': {
  //   paddingTop: 0,
  // },

  // Remove paddingTop on children of layout
  '[data-type$=layout] &': {
    paddingTop: 0,
  },
});

const isHiddenStyles = css({
  display: 'none',
});

export interface EditorBlockProps {
  readonly blockKind: keyof typeof blockAlignment;
  readonly children: ReactNode;
  readonly isHidden?: boolean;
  readonly fullWidth?: boolean;
  // This component is one of the main points of contact when integrating between editor and UI. As
  // such, we'll allow it to receive an arbitrary amount of props in order to facilitate said
  // integration.
  readonly [prop: string]: unknown;
  readonly onAnnotation?: () => void;
}

const editorBlockOffset = 30;
const fullWidthPadding = 60;

// editorBlockOffset contributes additional padding on the right
const fullWidthPaddingLeft = fullWidthPadding;
const fullWidthPaddingRight = fullWidthPadding - editorBlockOffset;

const fullWidthStyles = css({
  transform: `translateX(min(
    ${fullWidthPaddingLeft}px -
    (
      ${cssVar('editorWidth')} -
      ${slimBlockWidth}px
    ) / 2,
    0px
  ))`,
  minWidth: `calc(
    ${cssVar('editorWidth')} -
    ${fullWidthPaddingLeft + fullWidthPaddingRight}px
  )`,
});

export const EditorBlock: React.FC<EditorBlockProps> = forwardRef<
  HTMLDivElement,
  EditorBlockProps
>(({ blockKind, children, isHidden, fullWidth, ...props }, ref) => {
  const readOnly = useIsEditorReadOnly();

  return (
    <div
      {...props}
      css={[
        readOnly && isHidden && isHiddenStyles,
        isHidden && hideOnPrint,
        {
          position: 'relative',
          marginLeft: -editorBlockOffset,
          paddingLeft: editorBlockOffset,
          transition: 'all 0.2s ease-out',
        },
        spacingStyles,
        fullWidth && fullWidthStyles,
      ]}
      data-type={blockKind}
      ref={ref}
    >
      {children}
    </div>
  );
});
