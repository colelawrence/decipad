import { render } from 'test-utils';
import {  buildType, AST } from '@decipad/language';
import { ResultContent, ResultNumber } from './Result.component';

const nullPos = null as any;
const meters: AST.Unit[] = [
  {
    unit: 'meter',
    exp: 1,
    known: true,
    multiplier: 1,
    start: nullPos,
    end: nullPos,
  },
];

describe('Result', () => {
  it('renders numbers', () => {
    const { container } = render(
      <ResultContent type={buildType.number()} value={123} />
    );
    expect(container.textContent).toEqual('123');
  });

  it('renders numbers with units', () => {
    const { container } = render(
      <ResultContent type={buildType.number(meters)} value={1} />
    );

    expect(container.textContent).toEqual('1 meter');
  });

  it('renders strings', () => {
    const { container } = render(
      <ResultContent type={buildType.string()} value="hello world" />
    );
    expect(container.textContent).toEqual('hello world');
  });

  it('renders columns', async () => {
    const colContents = [1, 2, 3];
    const result = render(
      <ResultContent
        type={buildType.column(buildType.number(), 3)}
        value={colContents}
      />
    );

    const rows = await result.findAllByRole('row');

    expect(rows).toHaveLength(3);
    expect(rows.map((el) => el.textContent)).toEqual(colContents.map(String));
  });

  it('renders tables', async () => {
    const result = render(
      <ResultContent
        type={buildType.table({
          length: 3,
          columns: [buildType.string(), buildType.number()],
          columnNames: ['Name', 'Bananas'],
        })}
        value={[
          ['Sam', 'Fred', 'Sue'],
          [1.23, 100, 50],
        ]}
      />
    );

    const [header, ...rows] = await result.findAllByRole('row');

    const trimText = (elm: Element) => elm.textContent?.trim();

    const headerCells = [...header.querySelectorAll('th')];
    expect(headerCells.map(trimText)).toEqual(['Name', 'Bananas']);

    const tabulatedRows = rows.map((row) => [...row.children].map(trimText));
    expect(tabulatedRows).toEqual([
      ['Sam', '1.23'],
      ['Fred', '100'],
      ['Sue', '50'],
    ]);
  });
});

describe('ResultNumber', () => {
  it.each([
    [100, '100'],
    [1000, '1,000'],
    [10000, '10,000'],
    [100000, '100,000'],
    [1000000, '1,000,000'],
    [1000.1234, '1,000.1234'],
    [1e69, '1e+69'],
  ])('Commatizes %s', (num, expected) => {
    const { container } = render(<ResultNumber value={num} />);
    expect(container.textContent).toEqual(expected);
  });
});
