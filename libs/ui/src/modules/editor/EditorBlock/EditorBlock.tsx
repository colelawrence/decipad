/* eslint decipad/css-prop-named-variable: 0 */
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { forwardRef, ReactNode, useState } from 'react';
import { p16Regular } from '../../../primitives';
import { blockAlignment } from '../../../styles';
import { Chat } from 'libs/ui/src/icons';

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

const readOnlyCommentButtonStyles = css(`
  position: absolute;
  top: 26px;
  left: 0px;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  width: 18px;
  height: 18px;
`);

export const ReadOnlyCommentButton = ({
  onAnnotation,
}: {
  onAnnotation: () => void;
}) => {
  return (
    <button css={readOnlyCommentButtonStyles} onClick={onAnnotation}>
      <Chat />
    </button>
  );
};

interface EditorBlockProps {
  readonly blockKind: keyof typeof blockAlignment;
  readonly children: ReactNode;
  readonly isHidden?: boolean;
  // This component is one of the main points of contact when integrating between editor and UI. As
  // such, we'll allow it to receive an arbitrary amount of props in order to facilitate said
  // integration.
  readonly [prop: string]: unknown;
  readonly onAnnotation?: () => void;
}

const editorBlockOffset = 30;

export const EditorBlock: React.FC<EditorBlockProps> = forwardRef<
  HTMLDivElement,
  EditorBlockProps
>(({ blockKind, children, isHidden, ...props }, ref) => {
  const readOnly = useIsEditorReadOnly();
  const [, setShowCommentButton] = useState(false);

  return (
    <div
      {...props}
      onMouseEnter={() => setShowCommentButton(true)}
      onMouseLeave={() => setShowCommentButton(false)}
      css={[
        readOnly && isHidden && isHiddenStyles,
        {
          position: 'relative',
          marginLeft: -editorBlockOffset,
          paddingLeft: editorBlockOffset,
          transition: 'all 0.2s ease-out',
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
