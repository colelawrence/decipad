import {
  ComponentProps,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ReactEditor } from 'slate-react';
import { Plate, PlateProvider, TNode, usePlateEditorRef } from '@udecode/plate';
import { BasePoint, Transforms } from 'slate';
import { nanoid } from 'nanoid';
import { Computer, Parser } from '@decipad/language';
import { noop } from '@decipad/utils';
import { atoms, organisms } from '@decipad/ui';
import * as configuration from './configuration';
import { createOnLeavePlugin, createCodeLinePlugin } from './plugins';
import { editorNodesFromValue, expressionFromEditorNodes } from './utils';

type LeaveDirection = 'up' | 'down' | 'left' | 'right';

interface ExpressionEditorProps {
  value: string;
  computer: Computer;
  focus?: boolean;
  onFocus?: () => void;
  onChange?: (value: string) => void;
  onLeave?: (direction: LeaveDirection) => void;
  children?: ReactNode;
}

interface ExpressionEditorEditorProps extends ExpressionEditorProps {
  id: string;
}

const parserErrorToCodeError = (
  error: Parser.ParserError
): ComponentProps<typeof atoms.CodeError> => {
  return {
    ...error,
    url: '/docs',
  };
};

export const ExpressionEditorEditor = ({
  id,
  value,
  computer,
  focus,
  onFocus = noop,
  onChange = noop,
  onLeave = noop,
  children,
}: ExpressionEditorEditorProps): ReturnType<FC> => {
  const [parserError, setParserError] =
    useState<Parser.ParserError | undefined>();
  const editor = usePlateEditorRef(id);
  const parserErrorRef = useRef<Parser.ParserError | undefined>();

  const onInnerFocus = useCallback(() => {
    ReactEditor.focus(editor);
    onFocus();
  }, [editor, onFocus]);

  const onPlateChange = useCallback(
    (nodes: TNode[]) => {
      const { expression, error, source } = expressionFromEditorNodes(
        computer,
        nodes
      );
      if (error) {
        setParserError(error);
      } else if (expression) {
        setParserError(undefined);
        onChange(source);
      }
    },
    [computer, onChange]
  );

  const plugins = useMemo(
    () => [
      ...configuration.plugins,
      createCodeLinePlugin(parserErrorRef),
      createOnLeavePlugin(onLeave),
    ],
    [onLeave]
  );

  useEffect(() => {
    parserErrorRef.current = parserError;
  }, [parserError]);

  useEffect(() => {
    if (focus && editor) {
      ReactEditor.focus(editor);
    } else if (editor) {
      const startAnchor: BasePoint = { path: [0, 0], offset: 0 };
      Transforms.setSelection(editor, {
        anchor: startAnchor,
        focus: startAnchor,
      });
    }
  }, [editor, focus]);

  return (
    <organisms.ExpressionEditor
      focus={!!focus}
      onFocus={onInnerFocus}
      error={parserError && parserErrorToCodeError(parserError)}
    >
      <Plate
        id={id}
        plugins={plugins}
        initialValue={editorNodesFromValue(id, value)}
        onChange={onPlateChange}
        editableProps={{ onFocus }}
      >
        {children}
      </Plate>
    </organisms.ExpressionEditor>
  );
};

export const ExpressionEditor = (
  props: ExpressionEditorProps
): ReturnType<FC> => {
  const [id] = useState(nanoid);
  return (
    <PlateProvider id={id}>
      <ExpressionEditorEditor {...props} id={id} />
    </PlateProvider>
  );
};
