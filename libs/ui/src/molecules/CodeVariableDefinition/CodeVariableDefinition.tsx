import { SerializedType } from '@decipad/computer';
import { CellValueType, MyEditor } from '@decipad/editor-types';
import { css } from '@emotion/react';
import {
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useMemo,
  useState,
} from 'react';
import {
  eventEditorSelectors,
  findEventRange,
  findNodePath,
  focusEditor,
  getStartPoint,
  someNode,
  TElement,
} from '@udecode/plate';
import { Location } from 'slate';
import { Formula, Number } from '../../icons';
import { cssVar } from '../../primitives';
import { codeBlock } from '../../styles';
import { hideOnPrint } from '../../styles/editor-layout';
import { getTypeIcon } from '../../utils';

const varStyles = (type: 'simple' | 'formula') =>
  css(codeBlock.structuredVariableStyles, {
    padding: '4px 8px',
    borderRadius: '6px',
    background:
      type === 'formula'
        ? cssVar('structuredCalculationVariableColor')
        : cssVar('structuredCalculationSimpleColor'),
    display: 'flex',
    alignItems: 'center',
    overflowWrap: 'anywhere',
    maxWidth: '174px',
    whiteSpace: 'normal',
    '@media print': {
      background: 'unset',
    },
  });

const iconStyles = css({
  display: 'inline-flex',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  marginRight: '4px',
});

const emptyStyles = css({
  '::after': {
    display: 'inline',
    content: '" "',
  },
  // Slate creates a <br> for us. Pls no
  br: { display: 'none' },
});

const formulaIconStyles = css([
  hideOnPrint,
  {
    position: 'absolute',
    left: '-18px',
    width: '16px',
    height: '100%',
    display: 'grid',
    alignItems: 'center',
  },
]);

interface NonInteractiveCodeVariableProps {
  readonly children: ReactNode;
  readonly empty: boolean;
  readonly contentEditable: boolean;
  readonly type?: SerializedType | CellValueType;
  readonly readOnly?: boolean;
  readonly isValue?: boolean;
  readonly onClick?: MouseEventHandler<HTMLSpanElement>;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragEnd?: (e: React.DragEvent) => void;
}

export const shouldResetContentEditable = (
  editor: MyEditor,
  id: string,
  contentEditable: boolean
) => {
  if (!editor.selection) return false;
  if (eventEditorSelectors.blur() && !contentEditable) return false;

  const hasNode = someNode(editor, {
    match: {
      id,
    },
  });

  if (!contentEditable) {
    if (hasNode) {
      return true;
    }
  } else if (!hasNode) {
    return false;
  }

  return null;
};

export const focusMouseEventLocation = (
  editor: MyEditor,
  element: TElement,
  event: MouseEvent<HTMLSpanElement>
) => {
  let target: Location | undefined = findEventRange(editor, event);
  if (!target) {
    const at = findNodePath(editor, element);
    if (!at) return;

    target = getStartPoint(editor, at);
    if (!target) return;
  }

  focusEditor(editor, target);
};

export const getCodeVariableDefinitionRootProps = ({
  contentEditable,
  onDragEnd,
  onDragStartInlineResult,
  onClick,
  setGrabbing,
}: {
  contentEditable: boolean;
  setGrabbing: (grabbing: boolean) => void;
  onClick?: MouseEventHandler<HTMLSpanElement>;
  onDragStartInlineResult?: (e: React.DragEvent<HTMLSpanElement>) => void;
  onDragEnd?: (e: React.DragEvent<HTMLSpanElement>) => void;
}): HTMLAttributes<HTMLSpanElement> => {
  if (contentEditable) {
    return {};
  }

  return {
    draggable: true,
    onDragStart: (e: React.DragEvent<HTMLSpanElement>) => {
      onDragStartInlineResult?.(e);
      setGrabbing(true);
    },
    onDragEnd: (e: React.DragEvent<HTMLSpanElement>) => {
      onDragEnd?.(e);
      setGrabbing(false);
    },
    onClick,
  };
};

export const CodeVariableDefinition = ({
  isValue = true,
  empty,
  children,
  type,
  readOnly,
  contentEditable,
  onClick,
  onDragStartInlineResult,
  onDragEnd,
}: NonInteractiveCodeVariableProps) => {
  const [grabbing, setGrabbing] = useState(false);
  const Icon = useMemo(() => (type ? getTypeIcon(type) : Number), [type]);

  const rootProps: HTMLAttributes<HTMLSpanElement> = useMemo(
    () =>
      getCodeVariableDefinitionRootProps({
        contentEditable,
        onDragEnd,
        onDragStartInlineResult,
        onClick,
        setGrabbing,
      }),
    [onClick, contentEditable, onDragEnd, onDragStartInlineResult]
  );

  return (
    <span
      css={[
        varStyles(isValue ? 'simple' : 'formula'),
        empty && emptyStyles,
        !contentEditable &&
          onDragStartInlineResult && {
            cursor: 'grab',
          },
        !contentEditable && grabbing && { cursor: 'grabbing' },
      ]}
      contentEditable={!readOnly && contentEditable}
      {...rootProps}
    >
      {!isValue && (
        <span css={[formulaIconStyles]}>
          <Formula />
        </span>
      )}
      <span css={Icon && [hideOnPrint, iconStyles]} contentEditable={false}>
        {Icon && <Icon />}
      </span>
      <span>{children}</span>
    </span>
  );
};
