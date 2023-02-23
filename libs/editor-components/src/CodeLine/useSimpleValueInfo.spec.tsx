import { renderHook } from '@testing-library/react';

import {
  createTPlateEditor,
  MyEditor,
  MyValue,
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_STRUCTURED_VARNAME,
  MyElement,
} from '@decipad/editor-types';
import { Plate, getNodeString } from '@udecode/plate';
import { useState } from 'react';

import { AST, parseSimpleValueUnit, prettyPrintAST } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { timeout } from '@decipad/utils';
import { act } from 'react-dom/test-utils';
import { useSimpleValueInfo } from './useSimpleValueInfo';

const element: CodeLineV2Element = {
  type: ELEMENT_CODE_LINE_V2,
  id: 'line',
  children: [
    {
      type: ELEMENT_STRUCTURED_VARNAME,
      id: 'varname',
      children: [{ text: '' }],
    },
    {
      type: ELEMENT_CODE_LINE_V2_CODE,
      id: 'code',
      children: [{ text: '' }],
    },
  ],
};

it('displays a simple value on empty state', async () => {
  const { result } = renderHook(
    ({ element: e, value }) => useSimpleValueInfo(useComputer(), e, value),
    {
      wrapper: function Wrapper(props) {
        const [editor] = useState(() => {
          const e = createTPlateEditor();
          e.children = [element as MyElement] as MyValue;
          return e;
        });

        return (
          <Plate<MyValue, MyEditor> editor={editor}>{props.children}</Plate>
        );
      },
      initialProps: { element, value: '' },
    }
  );

  expect(result.current.simpleValue?.ast.toString()).toMatchInlineSnapshot(
    `"0"`
  );
});

it('displays unit when pre-fixed unit', async () => {
  const { result } = renderHook(
    ({ element: e, value }) => useSimpleValueInfo(useComputer(), e, value),
    {
      wrapper: function Wrapper(props) {
        const [editor] = useState(() => {
          const e = createTPlateEditor();
          e.children = [element as MyElement] as MyValue;
          return e;
        });

        return (
          <Plate<MyValue, MyEditor> editor={editor}>{props.children}</Plate>
        );
      },
      initialProps: { element, value: '$' },
    }
  );

  expect(
    prettyPrintAST(result.current.simpleValue?.unit as AST.Expression)
  ).toMatchInlineSnapshot(`"(ref $)"`);
});

it('should work', async () => {
  const { result } = renderHook(
    ({ element: e, value }) => useSimpleValueInfo(useComputer(), e, value),
    {
      wrapper: function Wrapper(props) {
        const [editor] = useState(() => {
          const e = createTPlateEditor();
          e.children = [element as MyElement] as MyValue;
          return e;
        });

        return (
          <Plate<MyValue, MyEditor> editor={editor}>{props.children}</Plate>
        );
      },
      initialProps: { element, value: '1 meter' },
    }
  );

  expect(
    prettyPrintAST(result.current.simpleValue?.unit as AST.Expression)
  ).toMatchInlineSnapshot(`"(ref meter)"`);

  await act(async () => {
    result.current.onChangeUnit(parseSimpleValueUnit('meters per TODO'));
    await timeout(0); // Slate's onChange is async
  });
  expect(getNodeString(result.current.editor)).toMatchInlineSnapshot(
    `"1 meters per TODO"`
  );

  await act(async () => {
    result.current.onChangeUnit('%');
    await timeout(0); // Slate
  });
  expect(getNodeString(result.current.editor)).toMatchInlineSnapshot(`"1%"`);

  await act(async () => {
    result.current.onChangeUnit(undefined);
    await timeout(0); // Slate
  });
  expect(getNodeString(result.current.editor)).toMatchInlineSnapshot(`"1"`);
});
