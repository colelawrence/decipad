import { findParentWithStyle } from '@decipad/dom-test-utils';
import {
  CodeBlockElement,
  CodeLineElement,
  ELEMENT_CODE_BLOCK,
  ELEMENT_CODE_LINE,
} from '@decipad/editor-types';
import { render } from '@testing-library/react';
import { Plate } from '@udecode/plate';
import { Computer } from '@decipad/language';
import { timeout } from '@decipad/utils';
import { ComputerContextProvider } from '@decipad/react-contexts';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import {
  createCodeBlockPlugin,
  createCodeLinePlugin,
  createCodeVariableHighlightPlugin,
} from '..';

const PlateWrapper = ({
  children,
  computer,
}: Pick<CodeBlockElement, 'children'> & { computer: Computer }) => (
  <DndProvider backend={HTML5Backend}>
    <Plate
      initialValue={[
        {
          type: ELEMENT_CODE_BLOCK,
          children,
        },
      ]}
      plugins={[
        createCodeBlockPlugin(),
        createCodeLinePlugin(computer),
        createCodeVariableHighlightPlugin(),
      ]}
    />
  </DndProvider>
);

describe('variable highlights', () => {
  it('show bubbles in variable declarations', () => {
    const children = [
      {
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'id=42' }],
      } as CodeLineElement,
    ];

    const { getByText } = render(
      <PlateWrapper children={children} computer={new Computer()} />
    );

    expect(
      findParentWithStyle(getByText(/id/), 'backgroundColor')!.backgroundColor
    ).not.toEqual(
      findParentWithStyle(getByText(/42/), 'backgroundColor')?.backgroundColor
    );
  });

  it('show bubbles in usages of defined variables', async () => {
    const computer = new Computer();
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

    await timeout(200);

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
      <ComputerContextProvider computer={computer}>
        <PlateWrapper children={children} computer={computer} />
      </ComputerContextProvider>
    );

    const [xDecl, xUsage] = getAllByText(/x/);
    expect(
      findParentWithStyle(xDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(findParentWithStyle(xUsage, 'backgroundColor')!.backgroundColor);
  });

  it('highlights defined columns of a table', async () => {
    const computer = new Computer();
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

    await timeout(200);

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
      <ComputerContextProvider computer={computer}>
        <PlateWrapper children={children} computer={computer} />
      </ComputerContextProvider>
    );

    const [tableDecl, tableUsage, notTableUsage] = getAllByText(/MyTable/).map(
      (t) => findParentWithStyle(t, 'backgroundColor')
    );
    const colDecl = findParentWithStyle(getByText(/\.A/), 'backgroundColor');
    const colUse = findParentWithStyle(getAllByText(/A/)[0], 'backgroundColor');
    const notCol = findParentWithStyle(getByText(/\.B/), 'backgroundColor');

    expect(tableDecl!.backgroundColor).toEqual(tableUsage!.backgroundColor);
    expect(tableDecl?.backgroundColor).not.toEqual(
      notTableUsage?.backgroundColor
    );

    expect(tableDecl!.backgroundColor).toEqual(colDecl!.backgroundColor);
    expect(tableDecl!.backgroundColor).toEqual(colUse!.backgroundColor);

    expect(tableDecl?.backgroundColor).not.toEqual(notCol?.backgroundColor);
  });

  it('highlights column access inside table', async () => {
    const computer = new Computer();
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'x = {\n  A = 1\n  B = A\n  C = t.A\n}',
        },
      ],
    });

    await timeout(200);

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'x = {\n  A = 1\n  B = A, C = t.A\n}' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <ComputerContextProvider computer={computer}>
        <PlateWrapper children={children} computer={computer} />
      </ComputerContextProvider>
    );

    const [colDecl, colUsage1, colUsage2] = getAllByText(/A/);
    expect(
      findParentWithStyle(colDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(
      findParentWithStyle(colUsage1, 'backgroundColor')!.backgroundColor
    );
    expect(
      findParentWithStyle(colDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(
      findParentWithStyle(colUsage2, 'backgroundColor')!.backgroundColor
    );
  });

  it('highlights column access with spaces', async () => {
    const computer = new Computer();
    await computer.pushCompute({
      program: [
        {
          type: 'unparsed-block',
          id: 'x1',
          source: 'x = {\n  A = 1\n  B = x . A\n}',
        },
      ],
    });

    const children = [
      {
        type: ELEMENT_CODE_LINE,
        id: 'x1',
        children: [{ text: 'x = {\n  A = 1\n  B = x . A\n}' }],
      } as CodeLineElement,
    ];

    const { getAllByText } = render(
      <ComputerContextProvider computer={computer}>
        <PlateWrapper children={children} computer={computer} />
      </ComputerContextProvider>
    );

    const [colDecl, colUsage] = getAllByText(/A/);
    const [tableDecl, tableUsage] = getAllByText(/x/);
    expect(
      findParentWithStyle(colDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(
      findParentWithStyle(colUsage, 'backgroundColor')!.backgroundColor
    );
    expect(
      findParentWithStyle(tableDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(
      findParentWithStyle(tableUsage, 'backgroundColor')!.backgroundColor
    );
  });

  it('show bubbles in table spreads', async () => {
    const computer = new Computer();
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

    await timeout(200);

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
      <ComputerContextProvider computer={computer}>
        <PlateWrapper children={children} computer={computer} />
      </ComputerContextProvider>
    );

    const [xDecl, xUsage] = getAllByText(/x/);
    expect(
      findParentWithStyle(xDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(findParentWithStyle(xUsage, 'backgroundColor')!.backgroundColor);
  });

  it('does not mistake a table column access for another declared variable', async () => {
    const computer = new Computer();
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

    await timeout(200);

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
      <ComputerContextProvider computer={computer}>
        <PlateWrapper children={children} computer={computer} />
      </ComputerContextProvider>
    );

    const [bVar, bColumn] = getAllByText(/B/);
    expect(
      findParentWithStyle(bVar, 'backgroundColor')?.backgroundColor
    ).not.toEqual(
      findParentWithStyle(bColumn, 'backgroundColor')?.backgroundColor
    );
  });

  it('show bubbles for external variables in function declarations', async () => {
    const computer = new Computer();
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

    await timeout(200);

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
      <ComputerContextProvider computer={computer}>
        <PlateWrapper children={children} computer={computer} />
      </ComputerContextProvider>
    );

    const [xDecl, xUsage] = getAllByText(/X/);
    expect(
      findParentWithStyle(xDecl, 'backgroundColor')!.backgroundColor
    ).toEqual(findParentWithStyle(xUsage, 'backgroundColor')!.backgroundColor);
  });
});
