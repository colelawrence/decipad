import { trimSheet } from './trimSheet';

test('trimSheet', () => {
  expect(trimSheet({ values: [] })).toEqual({ values: [] });
  expect(trimSheet({ values: [[]] })).toEqual({ values: [[]] });
  expect(trimSheet({ values: [[], [], []] })).toEqual({ values: [[], [], []] });
  expect(trimSheet({ values: [[1]] })).toEqual({
    values: [[1]],
  });
  expect(trimSheet({ values: [[1], [2], [3]] })).toEqual({
    values: [[1], [2], [3]],
  });
  expect(trimSheet({ values: [[''], [''], ['']] })).toEqual({
    values: [[], [], []],
  });
  expect(
    trimSheet({
      values: [
        ['', 1],
        ['', 2],
        ['', 3],
      ],
    })
  ).toEqual({
    values: [[1], [2], [3]],
  });
  expect(
    trimSheet({
      values: [
        [1, ''],
        [2, ''],
        [3, ''],
      ],
    })
  ).toEqual({
    values: [[1], [2], [3]],
  });
  expect(trimSheet({ values: [[1], [2, 3], [4, 5, 6]] })).toEqual({
    values: [
      [1, '', ''],
      [2, 3, ''],
      [4, 5, 6],
    ],
  });
  expect(
    trimSheet({
      values: [
        [1, '', 2],
        [3, '', 4],
        [5, '', 6],
      ],
    })
  ).toEqual({
    values: [
      [1, '', 2],
      [3, '', 4],
      [5, '', 6],
    ],
  });

  expect(
    trimSheet({
      values: [
        ['', 1],
        ['', 2, 3],
        ['', 4, 5, 6],
      ],
    })
  ).toEqual({
    values: [
      [1, '', ''],
      [2, 3, ''],
      [4, 5, 6],
    ],
  });
});
