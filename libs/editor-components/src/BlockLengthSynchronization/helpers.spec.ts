import { ELEMENT_CODE_LINE_V2 } from '@decipad/editor-types';
import {
  getContiguousGroups,
  getNewGroupsTargetLengths,
  setIn,
} from './helpers';

it('finds contiguous groups', () => {
  expect(
    getContiguousGroups([
      { id: '1', type: ELEMENT_CODE_LINE_V2 },
      { id: '2', type: ELEMENT_CODE_LINE_V2 },
    ])
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "memberIds": Array [
          "1",
          "2",
        ],
      },
    ]
  `);

  expect(
    getContiguousGroups([
      { id: '1', type: ELEMENT_CODE_LINE_V2 },
      { id: '2', type: ELEMENT_CODE_LINE_V2 },
      { id: '3', type: 'paragraph' },
      { id: '4', type: ELEMENT_CODE_LINE_V2 },
      { id: '5', type: ELEMENT_CODE_LINE_V2 },
    ])
  ).toMatchInlineSnapshot(`
    Array [
      Object {
        "memberIds": Array [
          "1",
          "2",
        ],
      },
      Object {
        "memberIds": Array [
          "4",
          "5",
        ],
      },
    ]
  `);

  expect(getContiguousGroups([])).toMatchInlineSnapshot(`Array []`);

  expect(getContiguousGroups([{ id: '1', type: ELEMENT_CODE_LINE_V2 }]))
    .toMatchInlineSnapshot(`
    Array [
      Object {
        "memberIds": Array [
          "1",
        ],
      },
    ]
  `);
});

it('generates target lengths per group and per column', () => {
  const measuredLengths = new Map([
    ['1', { variableNameColumn: 10, resultColumn: 20 }],
    ['2', { variableNameColumn: 20, resultColumn: 30 }],
    ['3', { variableNameColumn: 30, resultColumn: 40 }],
    ['4', { variableNameColumn: 40, resultColumn: 50 }],
    ['5', { variableNameColumn: 50, resultColumn: 60 }],
  ]);

  const groups = [{ memberIds: ['1', '2', '3'] }, { memberIds: ['4', '5'] }];

  const targetLengths = getNewGroupsTargetLengths(groups, measuredLengths);

  expect(targetLengths).toMatchInlineSnapshot(`
    Map {
      "1" => Object {
        "resultColumn": 40,
        "variableNameColumn": 30,
      },
      "2" => Object {
        "resultColumn": 40,
        "variableNameColumn": 30,
      },
      "3" => Object {
        "resultColumn": 40,
        "variableNameColumn": 30,
      },
      "4" => Object {
        "resultColumn": 60,
        "variableNameColumn": 50,
      },
      "5" => Object {
        "resultColumn": 60,
        "variableNameColumn": 50,
      },
    }
  `);
});

it('can deeply update a measuredLengths map', () => {
  const measuredLengths = new Map([
    ['1', { variableNameColumn: 10, resultColumn: 20 }],
    ['deleted', { variableNameColumn: 20, resultColumn: 30 }],
  ]);

  setIn(measuredLengths, '1', 'variableNameColumn', 100);
  setIn(measuredLengths, '1', 'resultColumn', undefined);

  setIn(measuredLengths, 'deleted', 'variableNameColumn', undefined);
  setIn(measuredLengths, 'deleted', 'resultColumn', undefined);

  setIn(measuredLengths, 'new-one', 'variableNameColumn', 1234);

  expect(measuredLengths).toMatchInlineSnapshot(`
    Map {
      "1" => Object {
        "variableNameColumn": 100,
      },
      "new-one" => Object {
        "variableNameColumn": 1234,
      },
    }
  `);
});
