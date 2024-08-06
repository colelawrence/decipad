/* eslint decipad/css-prop-named-variable: 0 */
import { CellValueType, MyEditor } from '@decipad/editor-types';
import type { SerializedType } from '@decipad/language-interfaces';
import { SerializedStyles, css } from '@emotion/react';
import {
  TElement,
  eventEditorSelectors,
  findEventRange,
  findNodePath,
  focusEditor,
  getStartPoint,
  someNode,
} from '@udecode/plate-common';
import { Loading, Tooltip } from 'libs/ui/src/shared';
import {
  HTMLAttributes,
  MouseEvent,
  MouseEventHandler,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { Location } from 'slate';
import { Formula, Sparkles, Number } from '../../../icons';
import { cssVar } from '../../../primitives';
import { codeBlock } from '../../../styles';
import { hideOnPrint } from '../../../styles/editor-layout';
import { getTypeIcon } from '../../../utils';

const varStyles = css(codeBlock.structuredVariableStyles, {
  padding: '2px 8px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  overflowWrap: 'anywhere',
  maxWidth: '174px',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  '@media print': {
    background: 'unset',
  },
});

const codeVarIconStyles = css({
  display: 'inline-flex',
  verticalAlign: 'text-top',
  height: '16px',
  width: '16px',
  '> svg': { height: '16px', width: '16px' }, // safari
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
  readonly formulaIcon?: boolean;
  readonly onClick?: MouseEventHandler<HTMLSpanElement>;
  readonly onDragStartInlineResult?: (e: React.DragEvent) => void;
  readonly onDragEnd?: (e: React.DragEvent) => void;
  readonly onGenerateName: () => Promise<void>;
  readonly onCancelGenerateName: () => void;
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
  formulaIcon = false,
  empty,
  children,
  type,
  readOnly,
  contentEditable,
  onClick,
  onDragStartInlineResult,
  onDragEnd,
  onGenerateName,
  onCancelGenerateName,
}: NonInteractiveCodeVariableProps) => {
  const [grabbing, setGrabbing] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const Icon = useMemo(() => (type ? getTypeIcon(type) : Number), [type]);

  const handleGenerateName = useCallback(async () => {
    setIsGenerating(true);
    await onGenerateName();
    setIsGenerating(false);
  }, [onGenerateName]);

  const handleCancelGenerateName = useCallback(() => {
    setIsGenerating(false);
    onCancelGenerateName();
  }, [onCancelGenerateName]);

  const varThemeStyles: SerializedStyles = css({
    backgroundColor: contentEditable
      ? cssVar('themeBackgroundHeavy')
      : cssVar('themeBackgroundSubdued'),
    color: cssVar('themeTextDefault'),
  });

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
      className="codevardef"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      css={[
        varStyles,
        varThemeStyles,
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
      {formulaIcon && (
        <span
          css={[
            formulaIconStyles,
            {
              mixBlendMode: 'luminosity',
            },
          ]}
        >
          <Formula />
        </span>
      )}
      {(!hovering || readOnly) && !isGenerating ? (
        <span
          css={
            Icon && [
              hideOnPrint,
              codeVarIconStyles,
              {
                mixBlendMode: 'luminosity',
              },
            ]
          }
          contentEditable={false}
        >
          {Icon && <Icon />}
        </span>
      ) : (
        <Tooltip
          trigger={
            <button
              css={[
                hideOnPrint,
                codeVarIconStyles,
                {
                  mixBlendMode: 'luminosity',
                },
              ]}
              contentEditable={false}
              onClick={(e) => {
                e.stopPropagation();
                isGenerating
                  ? handleCancelGenerateName()
                  : handleGenerateName();
              }}
            >
              {isGenerating ? <Loading /> : <Sparkles />}
            </button>
          }
        >
          {isGenerating ? 'Generating name...' : 'Rename with AI'}
        </Tooltip>
      )}
      <span>{children}</span>
    </span>
  );
};
