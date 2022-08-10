import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import {
  CodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
  MyValue,
} from '@decipad/editor-types';
import { render } from '@testing-library/react';
import { Plate } from '@udecode/plate';
import { Computer } from '@decipad/computer';
import { timeout } from '@decipad/utils';
import { ComputerContextProvider } from '@decipad/react-contexts';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { createCodeLinePlugin, createCodeVariableHighlightPlugin } from '..';

let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

type PlateWrapperProps = Pick<CodeBlockElement, 'children'> & {
  computer: Computer;
};
const PlateWrapper = ({ children, computer }: PlateWrapperProps) => (
  <DndProvider backend={HTML5Backend}>
    <ComputerContextProvider computer={computer}>
      <Plate<MyValue>
        initialValue={[
          {
            type: ELEMENT_CODE_BLOCK,
            children,
          } as never,
        ]}
        plugins={[
          createCodeLinePlugin(computer),
          createCodeVariableHighlightPlugin(),
        ]}
      />
    </ComputerContextProvider>
  </DndProvider>
);

describe('variable highlights', () => {
  it('show bubbles in variable declarations', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'id = 42',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'id = 42' }],
      } as CodeLineElement,
    ];

    const { getByText, getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );
    cleanup = await applyCssVars();
    const bubbleBackgroundColor = findParentWithStyle(
      getByText(/id/),
      'backgroundColor'
    )?.backgroundColor;
    const normalBackgroundColor = findParentWithStyle(
      getAllByText(/42/)[0],
      'backgroundColor'
    )?.backgroundColor;
    cleanup();

    expect(bubbleBackgroundColor).not.toEqual(normalBackgroundColor);
  });

  it('show bubbles in usages of defined variables', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'x=42',
        },
        {
          type: 'unparsed-block',
          id: 'x2',
          source: 'y=x',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'x=42' }],
      } as CodeLineElement,
      {
        type: ELEMENT_CODE_LINE,
        id: 'x2',
        children: [{ text: 'y=x' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );

    const [xDecl, xUsage] = getAllByText(/x/);

    cleanup = await applyCssVars();
    const xDBackgroundColor = findParentWithStyle(
      xDecl,
      'backgroundColor'
    )?.backgroundColor;
    const xUBackgroundColor = findParentWithStyle(
      xUsage,
      'backgroundColor'
    )?.backgroundColor;
    cleanup();
    expect(xDBackgroundColor).toEqual(xUBackgroundColor);
  });

  it('highlights defined columns of a table', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'MyTable = { A = [1] }',
        },
        {
          type: 'unparsed-block',
          id: 'x2',
          source: 'MyTable.A',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'MyTable = { A = [1] }' }],
      } as CodeLineElement,
      {
        type: ELEMENT_CODE_LINE,
        id: 'x2',
        children: [{ text: 'MyTable.A' }],
      } as CodeLineElement,
      {
        type: ELEMENT_CODE_LINE,
        id: 'x2',
        children: [{ text: 'MyTable.B' }],
      } as CodeLineElement,
    ];

    const { getByText, getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );

    cleanup = await applyCssVars();
    const [tableDecl, tableUsage, notTableUsage] = getAllByText(/MyTable/).map(
      (t) => findParentWithStyle(t, 'backgroundColor')
    );
    const colDecl = findParentWithStyle(getByText(/\.A/), 'backgroundColor');
    const colUse = findParentWithStyle(getAllByText(/A/)[0], 'backgroundColor');
    const notCol = findParentWithStyle(getByText(/\.B/), 'backgroundColor');
    cleanup();

    expect(tableDecl!.backgroundColor).toEqual(tableUsage!.backgroundColor);
    expect(tableDecl?.backgroundColor).not.toEqual(
      notTableUsage?.backgroundColor
    );

    expect(tableDecl!.backgroundColor).toEqual(colDecl!.backgroundColor);
    expect(tableDecl!.backgroundColor).not.toEqual(colUse!.backgroundColor);

    expect(tableDecl?.backgroundColor).not.toEqual(notCol?.backgroundColor);
  });

  it('highlights column access inside table', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'defining t for test purposes',
          source: 't = {A = 1}',
        },
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'x = {\n  A = 1\n  B = A\n  C = t.A\n}',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'x = {\n  A = 1\n  B = A, C = t.A\n}' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );

    const [colDecl, colUsage1, colUsage2] = getAllByText(/A/);
    cleanup = await applyCssVars();
    expect(
      findParentWithStyle(colDecl, 'backgroundColor')!.backgroundColor
    ).not.toEqual(
      findParentWithStyle(colUsage1, 'backgroundColor')!.backgroundColor
    );
    expect(
      findParentWithStyle(colUsage1, 'backgroundColor')!.backgroundColor
    ).toEqual(
      findParentWithStyle(colUsage2, 'backgroundColor')!.backgroundColor
    );
  });

  it('highlights column access with spaces', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'x = {\n  A = 1\n  B = x . A\n}',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'x = {\n  A = 1\n  B = x . A\n}' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );

    const [colDecl, colUsage] = getAllByText(/A/);
    const [tableDecl, tableUsage] = getAllByText(/x/);
    cleanup = await applyCssVars();
    expect(
      findParentWithStyle(colDecl, 'backgroundColor')!.backgroundColor
    ).not.toEqual(
      findParentWithStyle(colUsage, 'backgroundColor')!.backgroundColor
    );
    expect(
      findParentWithStyle(tableDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(
      findParentWithStyle(tableUsage, 'backgroundColor')!.backgroundColor
    );
  });

  it('show bubbles in table spreads', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'x = { A = [1]}',
        },
        {
          type: 'unparsed-block',
          id: 'x2',
          source: 'y = { ...x }',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'x = { A = [1] }' }],
      } as CodeLineElement,
      {
        type: ELEMENT_CODE_LINE,
        id: 'x2',
        children: [{ text: 'y = { ...x }' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );

    const [xDecl, xUsage] = getAllByText(/x/);
    cleanup = await applyCssVars();
    expect(
      findParentWithStyle(xDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(findParentWithStyle(xUsage, 'backgroundColor')!.backgroundColor);
  });

  // eslint-disable-next-line jest/no-disabled-tests
  it.skip('does not mistake a table column access for another declared variable', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'x = { A = [1]}',
        },
        {
          type: 'unparsed-block',
          id: 'x2',
          source: 'B = 2',
        },
        {
          type: 'unparsed-block',
          id: 'x3',
          source: 'x.B',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'x = { A = [1] }' }],
      } as CodeLineElement,
      {
        type: ELEMENT_CODE_LINE,
        id: 'x2',
        children: [{ text: 'B = 2' }],
      } as CodeLineElement,
      {
        type: ELEMENT_CODE_LINE,
        id: 'x3',
        children: [{ text: 'x.B' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );

    const [bVar, bColumn] = getAllByText(/B/);
    cleanup = await applyCssVars();
    expect(
      findParentWithStyle(bVar, 'backgroundColor')?.backgroundColor
    ).not.toEqual(
      findParentWithStyle(bColumn, 'backgroundColor')?.backgroundColor
    );
  });

  it('show bubbles for external variables in function declarations', async () => {
    const computer = new Computer({ requestDebounceMs: 0 });
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'X=3',
        },
        {
          type: 'unparsed-block',
          id: 'x2',
          source: 'F(A) = A+X',
        },
      ],
    });

    await timeout(0);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'X=3' }],
      } as CodeLineElement,
      {
        type: ELEMENT_CODE_LINE,
        id: 'x2',
        children: [{ text: 'F(A) = A+X' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <PlateWrapper children={children} computer={computer} />
    );

    const [xDecl, xUsage] = getAllByText(/X/);
    cleanup = await applyCssVars();
    expect(
      findParentWithStyle(xDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(findParentWithStyle(xUsage, 'backgroundColor')!.backgroundColor);
  });
});
