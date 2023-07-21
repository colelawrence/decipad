import { getExprRef } from '@decipad/computer';
import { useEditorChange } from '@decipad/editor-hooks';
import {
  MyElement,
  PlateComponent,
  RichText,
  useTEditorRef,
} from '@decipad/editor-types';
import {
  getAboveNodeSafe,
  insertStructuredCodeLineBelow,
  magicNumberId,
} from '@decipad/editor-utils';
import {
  useComputer,
  useIsEditorReadOnly,
  useResult,
  useShadowCodeLine,
} from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import {
  Button,
  CodeError,
  CodeLineFloat,
  ParagraphFormulaEditor,
  MagicNumber as UIMagicNumber,
  VoidBlock,
} from '@decipad/ui';
import { getDefined } from '@decipad/utils';
import { css } from '@emotion/react';
import { findNodePath, getNodeString, insertText } from '@udecode/plate';
import { useCallback, useState } from 'react';
import { Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { DISMISS_KEYS } from '../../CodeLine/CodeLineTeleport';
import { BlockErrorBoundary } from '../../BlockErrorBoundary';

const UnprotectedMagicNumber: PlateComponent = ({
  attributes,
  element,
  text: _text,
  children,
}) => {
  const computer = useComputer();
  const readOnly = useIsEditorReadOnly();
  const text = getDefined(_text);
  const exp = getNodeString(text);

  const blockId = useMagicNumberId(text);

  const shadow = useShadowCodeLine(blockId);

  const result = useResult(blockId)?.result;

  const editor = useTEditorRef();

  const [inlineExpEditorVisible, setInlineExpEditorVisible] = useState(false);
  const [magicNumberInput, setMagicNumberInput] = useState(exp);

  const { editSource, isEditing } = shadow;

  const isLoading = !result || result?.type.kind === 'pending';
  const hasError = result?.type.kind === 'type-error';
  const userIsEditing = inlineExpEditorVisible || isEditing;
  const loadingState = isLoading || (hasError && userIsEditing);

  // dont link to tables, because it makes
  // formulas not be seen `Table.Column`
  const isTableReference = !exp.includes('.');
  const sourceId = computer.getVarBlockId$.use(exp);

  useWindowListener(
    'keydown',
    (event) => {
      if (inlineExpEditorVisible && DISMISS_KEYS.includes(event.key)) {
        event.stopPropagation();
        event.preventDefault();
        setInlineExpEditorVisible(false);
      }
    },
    true
  );

  const onCreateInput = useCallback(() => {
    if (!_text) return;
    const path = ReactEditor.findPath(editor as ReactEditor, _text);
    if (!path) return;

    const newBlockId = insertStructuredCodeLineBelow({
      editor,
      path,
      select: true,
      getAvailableIdentifier: computer.getAvailableIdentifier.bind(computer),
      code: magicNumberInput,
    });

    insertText(editor, getExprRef(newBlockId), {
      at: path,
    });

    setInlineExpEditorVisible(false);
  }, [magicNumberInput, _text, editor, computer]);

  const onClick = useCallback(() => {
    if (typeof sourceId !== 'string' || !isTableReference) {
      setInlineExpEditorVisible(true);
      return;
    }

    const isCodeline = editSource(sourceId, text);
    if (!isCodeline) {
      const el = document.getElementById(sourceId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    }
  }, [sourceId, isTableReference, editSource, text]);

  return (
    <span {...attributes}>
      <span ref={shadow.numberRef}>
        <UIMagicNumber
          tempId={blockId}
          loadingState={loadingState}
          result={result}
          expression={exp}
          onClick={onClick}
          readOnly={readOnly}
          element={element}
          isReference={sourceId !== undefined}
        />
        {shadow.portal}
      </span>
      {inlineExpEditorVisible && (
        <span
          css={{
            position: 'absolute',
          }}
        >
          <VoidBlock dontPreventDefault>
            <CodeLineFloat offsetTop={25}>
              <ParagraphFormulaEditor
                formula={
                  <input
                    css={{
                      width: '100%',
                      backgroundColor: 'inherit',
                    }}
                    value={magicNumberInput}
                    autoFocus
                    onChange={(ev) => {
                      const newValue = ev.target.value;
                      setMagicNumberInput(newValue);
                      if (newValue.length <= 0) return;

                      if (_text) {
                        const getPath = ReactEditor.findPath(
                          editor as ReactEditor,
                          _text
                        );
                        if (getPath) {
                          insertText(editor, newValue, { at: getPath });
                        }
                      } else {
                        console.error('could not write');
                      }
                    }}
                    onBlur={(evt) => {
                      const domNodeRole =
                        evt.relatedTarget?.getAttribute('data-testid') || '';
                      if (!domNodeRole.includes('unnamed-label'))
                        setInlineExpEditorVisible(false);
                    }}
                  />
                }
                varName={
                  <Button
                    type="primary"
                    size="extraSlim"
                    onClick={onCreateInput}
                    testId="unnamed-label"
                  >
                    Turn into input
                  </Button>
                }
              />
            </CodeLineFloat>
          </VoidBlock>
        </span>
      )}
      <span contentEditable={false} css={css({ display: 'none' })}>
        {children}
      </span>
    </span>
  );
};

export const MagicNumber: PlateComponent = (props) => {
  return (
    <BlockErrorBoundary
      UserFallback={({ error }) => <CodeError message={error.message} />}
    >
      <UnprotectedMagicNumber {...props} />
    </BlockErrorBoundary>
  );
};

/** Get the ID of the magic number, comprised of paragraph and index */
function useMagicNumberId(text: RichText) {
  return useEditorChange((editor) => {
    const path = findNodePath(editor, text);
    if (!path) return '';

    const entry = getAboveNodeSafe(editor, {
      at: path,
      match: (node) => Element.isElement(node),
    });

    if (!entry) return '';

    return magicNumberId(entry[0] as MyElement, path[path.length - 1]);
  });
}
