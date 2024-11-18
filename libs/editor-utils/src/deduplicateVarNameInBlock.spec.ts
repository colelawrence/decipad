import { it, expect, beforeEach, describe, vi } from 'vitest';
import type {
  TableElement,
  VariableDropdownElement,
} from '@decipad/editor-types';
import { getComputer } from '@decipad/computer';
import { clone } from './clone';

vi.mock('nanoid', () => ({
  nanoid: () => 'mocked-nano-id',
}));

describe('Clone proxy', () => {
  let computer = getComputer();

  beforeEach(() => {
    computer = getComputer();
  });

  it('deduplicates the IDs in dropdown widget', () => {
    const dropdownElement: VariableDropdownElement = {
      type: 'def',
      id: '0',
      variant: 'dropdown',
      children: [
        { type: 'caption', id: '1', children: [{ text: '' }] },
        {
          type: 'dropdown',
          id: '2',
          options: [{ id: 'option-id-1', value: 'hello world' }],
          children: [{ text: '' }],
        },
      ],
    };

    expect(clone(computer, dropdownElement)).toMatchObject({
      children: [
        {
          children: [
            {
              text: 'Copy',
            },
          ],
          id: 'mocked-nano-id',
          type: 'caption',
        },
        {
          children: [
            {
              text: '',
            },
          ],
          id: 'mocked-nano-id',
          options: [
            {
              id: 'mocked-nano-id',
              value: 'hello world',
            },
          ],
          type: 'dropdown',
        },
      ],
      id: 'mocked-nano-id',
      type: 'def',
      variant: 'dropdown',
    });
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

    expect(clone(computer, tableElement)).toMatchObject({
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
