import { Result } from '@decipad/computer';
import { N } from '@decipad/number';
import { VirtualColumn } from '../types';
import { layoutPowerData } from './useDataViewLayoutData';

describe('layoutPowerData', () => {
  it('lays out an empty table', async () => {
    expect(
      await layoutPowerData({
        columns: [],
        aggregationTypes: [],
        expandedGroups: [],
        preventExpansion: false,
        rotate: false,
      })
    ).toEqual([]);
  });

  it('lays out empty a one-column one-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'columnName',
        blockId: 'A',
        value: Result.Column.fromValues([N(1)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(
      await layoutPowerData({
        columns,
        aggregationTypes: [],
        expandedGroups: [],
        preventExpansion: false,
        rotate: false,
      })
    ).toMatchObject([
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(1),
      },
    ]);
  });

  it('lays out an un-groupable one-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'columnName',
        blockId: 'A',
        value: Result.Column.fromValues([N(1), N(2), N(3)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(
      await layoutPowerData({
        columns,
        aggregationTypes: [],
        expandedGroups: [],
        preventExpansion: false,
        rotate: false,
      })
    ).toMatchObject([
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(1),
      },
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(2),
      },
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(3),
      },
    ]);
  });

  it('lays out a groupable one-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'columnName',
        blockId: 'A',
        value: Result.Column.fromValues([N(1), N(2), N(1)]),
        type: { kind: 'number', unit: null },
      },
    ];
    expect(
      await layoutPowerData({
        columns,
        aggregationTypes: [],
        expandedGroups: [],
        preventExpansion: false,
        rotate: false,
      })
    ).toMatchObject([
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(1),
      },
      {
        children: [],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(2),
      },
    ]);
  });

  it('lays out a un-groupable two-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'Column1',
        blockId: 'A',
        value: Result.Column.fromValues([N(1), N(2), N(3)]),
        type: { kind: 'number', unit: null },
      },
      {
        name: 'Column2',
        blockId: 'A',
        value: Result.Column.fromValues([N(4), N(5), N(6)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(
      await layoutPowerData({
        columns,
        aggregationTypes: [],
        expandedGroups: [],
        preventExpansion: false,
        rotate: false,
      })
    ).toMatchObject([
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(4),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(1),
      },
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(5),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(2),
      },
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(6),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(3),
      },
    ]);
  });

  it('lays out a groupable two-column multi-cell table', async () => {
    const columns: Array<VirtualColumn> = [
      {
        name: 'Column1',
        blockId: 'A',
        value: Result.Column.fromValues([N(1), N(2), N(1)]),
        type: { kind: 'number', unit: null },
      },
      {
        name: 'Column2',
        blockId: 'A',
        value: Result.Column.fromValues([N(4), N(5), N(6)]),
        type: { kind: 'number', unit: null },
      },
    ];

    expect(
      await layoutPowerData({
        columns,
        aggregationTypes: [],
        expandedGroups: [],
        preventExpansion: false,
        rotate: false,
      })
    ).toMatchObject([
      {
        children: [],
        collapsible: true,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: {
          d: 1n,
          n: 1n,
          s: 1n,
        },
      },
      {
        children: [
          {
            children: [],
            collapsible: false,
            columnIndex: 1,
            elementType: 'group',
            type: {
              kind: 'number',
              unit: null,
            },
            value: N(5),
          },
        ],
        collapsible: false,
        columnIndex: 0,
        elementType: 'group',
        type: {
          kind: 'number',
          unit: null,
        },
        value: N(2),
      },
    ]);
  });
});
