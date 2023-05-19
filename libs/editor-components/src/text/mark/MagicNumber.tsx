import { getExprRef } from '@decipad/computer';
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
  CodeLineFloat,
  MagicNumber as UIMagicNumber,
  ParagraphFormulaEditor,
  VoidBlock,
} from '@decipad/ui';
import { getDefined, dequal } from '@decipad/utils';
import { css } from '@emotion/react';
import { findNodePath, getNodeString, insertText } from '@udecode/plate';
import { useCallback, useEffect, useState } from 'react';
import { Element } from 'slate';
import { ReactEditor } from 'slate-react';
import { useEditorChange } from '@decipad/editor-hooks';
import { DISMISS_KEYS } from '../../CodeLine/CodeLineTeleport';

export const MagicNumber: PlateComponent = ({
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

  const [result, setResult] = useState(
    computer.getBlockIdResult$.get(blockId)?.result
  );
  const contextResult = useResult(blockId)?.result;

  useEffect(() => {
    if (
      contextResult &&
      contextResult.type.kind !== 'type-error' &&
      !dequal(result, contextResult)
    ) {
      setResult(contextResult);
    }
  }, [contextResult, result]);

  const editor = useTEditorRef();

  const [inlineExpEditorVisible, setInlineExpEditorVisible] = useState(false);
  const [magicNumberInput, setMagicNumberInput] = useState(exp);

  const loadingState =
    result?.type?.kind === 'type-error' ||
    (result?.type?.kind === 'number' && result?.type?.unit?.[0].unit === exp);

  const { editSource } = shadow;

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
    if (typeof sourceId !== 'string') {
      setInlineExpEditorVisible(true);
      return;
    }

    const isCodeline = editSource(sourceId, text);
    if (!isCodeline) {
      const el = document.getElementById(sourceId);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el?.focus();
    }
  }, [text, editSource, sourceId]);

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
