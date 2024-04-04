import type { TableElement } from '@decipad/editor-types';
import { getRemoteComputer } from '@decipad/remote-computer';
import utils from './utils';

jest.mock('nanoid', () => ({
  nanoid: () => 'mocked-nano-id',
}));

describe('Clone proxy', () => {
  let computer = getRemoteComputer();

  beforeEach(() => {
    computer = getRemoteComputer();
  });

  it('deduplicates the IDs in category values in tables', () => {
    const tableElement: TableElement = {
      type: 'table',
      id: '0',
      children: [
        {
          type: 'table-caption',
          id: '1',
          children: [
            {
              type: 'table-var-name',
              children: [{ text: 'table name' }],
              id: '2',
            },
          ],
        },
        {
          type: 'tr',
          id: '3',
          children: [
            {
              type: 'th',
              id: '4',

              cellType: {
                id: 'dropdown',
                kind: 'dropdown',
                type: 'number',
              },

              children: [{ text: 'col' }],
              categoryValues: [
                { id: 'my-id', value: '5' },
                { id: 'my-other-id', value: '10' },
              ],
            },
          ],
        },
      ],
    };

    expect(utils.cloneProxy(computer, tableElement)).toMatchObject({
      children: [
        {
          children: [
            {
              children: [
                {
                  text: 'table nameCopy',
                },
              ],
              id: 'mocked-nano-id',
              type: 'table-var-name',
            },
          ],
          id: 'mocked-nano-id',
          type: 'table-caption',
        },
        {
          children: [
            {
              categoryValues: [
                {
                  id: 'mocked-nano-id',
                  value: '5',
                },
                {
                  id: 'mocked-nano-id',
                  value: '10',
                },
              ],
              cellType: {
                id: 'dropdown',
                kind: 'dropdown',
                type: 'number',
              },
              children: [
                {
                  text: 'col',
                },
              ],
              id: 'mocked-nano-id',
              type: 'th',
            },
          ],
          id: 'mocked-nano-id',
          type: 'tr',
        },
      ],
      id: 'mocked-nano-id',
      type: 'table',
    });
  });
});
