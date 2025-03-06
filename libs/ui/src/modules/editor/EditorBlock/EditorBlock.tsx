import { FC, ReactNode, Ref } from 'react';
import { blockAlignment } from '../../../styles';
import { ElementAttributes } from '@decipad/editor-types';
import {
  DRAGGABLE_BLOCK_DIV,
  editableEditorBlock,
  readOnlyEditorBlock,
} from './block-styling';
import { useMergedRef } from 'libs/ui/src/hooks';

export type EditorBlockProps = {
  blockKind: keyof typeof blockAlignment;
  children: ReactNode;
  isHidden?: boolean;
  fullWidth?: boolean;
  elementId?: string;

  isReadOnly: boolean;
  isSelected?: boolean;

  'data-testId'?: string;

  layoutDirection?: 'rows' | 'columns';
  contentEditable?: boolean;
  slateAttributes?: ElementAttributes;

  blockRef?: Ref<HTMLDivElement>;
  previewHtmlRef?: Ref<HTMLDivElement>;

  AddNewLine: ReactNode;
  DragHandle: ReactNode;
  ContextualActions: ReactNode;
};

export const EditorBlock: FC<EditorBlockProps> = ({
  blockKind,
  children,
  isHidden,
  fullWidth,
  elementId,
  'data-testId': dataTestId,
  layoutDirection,
  contentEditable,
  slateAttributes,
  isReadOnly,

  isSelected = false,

  blockRef,
  previewHtmlRef,

  AddNewLine,
  DragHandle,
  ContextualActions,
}) => {
  const additionalHtmlProps: { [key: string]: any } = slateAttributes ?? {};
  if (dataTestId != null) {
    additionalHtmlProps['data-testid'] = dataTestId;
  }

  if (contentEditable != null) {
    additionalHtmlProps.contentEditable = contentEditable;
  }

  if (elementId != null) {
    additionalHtmlProps['data-element-id'] = elementId;
  }

  const mergedRef = useMergedRef(
    previewHtmlRef,
    blockRef ?? slateAttributes?.ref
  );

  if (isReadOnly && isHidden) {
    return null;
  }

  if (!isReadOnly) {
    return (
      <div
        {...additionalHtmlProps}
        data-readonly={isReadOnly}
        data-hidden={isHidden}
        data-fullwidth={fullWidth}
        data-type={blockKind}
        data-layout={layoutDirection}
        data-selected={isSelected}
        css={editableEditorBlock}
        ref={mergedRef}
        id={elementId}
      >
        {AddNewLine}
        {DragHandle}
        <div
          className={DRAGGABLE_BLOCK_DIV}
          data-draggable-inside
          data-testid="draggable-block-div"
        >
          {children}
        </div>
        {ContextualActions}
      </div>
    );
  } else {
    return (
      <div
        {...additionalHtmlProps}
        data-readonly={isReadOnly}
        data-hidden={isHidden}
        data-fullwidth={fullWidth}
        data-type={blockKind}
        data-layout={layoutDirection}
        css={readOnlyEditorBlock}
        ref={mergedRef}
      >
        <div
          className={DRAGGABLE_BLOCK_DIV}
          data-draggable-inside
          data-testid="draggable-block-div"
        >
          {children}
        </div>
      </div>
    );
  }
};
