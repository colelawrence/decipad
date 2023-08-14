import { seriesIterator } from './seriesIterator';

const iterate = (it: Iterable<string>, max = 10): Array<string> => {
  const acc: string[] = [];
  const iterator = it[Symbol.iterator]();
  for (let i = 0; i < max; i += 1) {
    const next = iterator.next();
    if (typeof next.value === 'string') {
      acc.push(next.value);
    }
    if (next.done) {
      break;
    }
  }
  return acc;
};

describe('series iterator', () => {
  it('iterates over number', () => {
    expect(iterate(seriesIterator('number', undefined, '75')))
      .toMatchInlineSnapshot(`
      Array [
        "76",
        "77",
        "78",
        "79",
        "80",
        "81",
        "82",
        "83",
        "84",
        "85",
      ]
    `);
  });

  it('iterates over date', () => {
    expect(iterate(seriesIterator('date', 'month', '2023-11')))
      .toMatchInlineSnapshot(`
      Array [
        "2023-12",
        "2024-01",
        "2024-02",
        "2024-03",
        "2024-04",
        "2024-05",
        "2024-06",
        "2024-07",
        "2024-08",
        "2024-09",
      ]
    `);
  });

  it('does not error on erroneous number', () => {
    expect(
      iterate(seriesIterator('number', undefined, '2023-0'))
    ).toMatchInlineSnapshot(`Array []`);
  });

  it('does not error on erroneous date', () => {
    expect(
      iterate(seriesIterator('date', 'month', '2023'))
    ).toMatchInlineSnapshot(`Array []`);
  });
});
