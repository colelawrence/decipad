/* eslint decipad/css-prop-named-variable: 0 */
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';
import { FC, ReactNode, Ref } from 'react';
import { p16Regular } from '../../../primitives';
import { blockAlignment, table } from '../../../styles';
import { ElementAttributes } from '@decipad/editor-types';

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

export type EditorBlockProps = {
  blockKind: keyof typeof blockAlignment;
  children: ReactNode;
  isHidden?: boolean;
  fullWidth?: boolean;
  fullHeight?: boolean;

  'data-testId'?: string;

  layoutDirection?: 'rows' | 'columns';
  contentEditable?: boolean;
  slateAttributes?: ElementAttributes;
  blockRef?: Ref<HTMLDivElement>;
};

const editorBlockOffset = 30;

export const EditorBlock: FC<EditorBlockProps> = ({
  blockKind,
  children,
  isHidden,
  fullWidth,
  fullHeight,
  'data-testId': dataTestId,
  layoutDirection,
  contentEditable,
  slateAttributes,
  blockRef,
}) => {
  const readOnly = useIsEditorReadOnly();

  const additionalHtmlProps: { [key: string]: any } = slateAttributes ?? {};
  if (dataTestId != null) {
    additionalHtmlProps['data-testid'] = dataTestId;
  }

  if (contentEditable != null) {
    additionalHtmlProps.contentEditable = contentEditable;
  }

  return (
    <div
      {...additionalHtmlProps}
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
        fullWidth && table.fullWidthStyles,
        fullHeight && { height: '100%' },
      ]}
      data-type={blockKind}
      data-layout={layoutDirection}
      ref={blockRef ?? slateAttributes?.ref}
    >
      {children}
    </div>
  );
};
