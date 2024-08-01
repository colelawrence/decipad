/* eslint-disable no-new */
import { describe, it, vi, expect } from 'vitest';
import { EditorController } from './EditorController';
import {
  CodeLineElement,
  DataTabChildrenElement,
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { BlockProcessor } from './BlockProcessor';
import { getComputer } from '@decipad/computer';
import { timeout } from '@decipad/utils';

vi.mock('nanoid', () => {
  let mockedId = 0;
  return {
    nanoid: () => {
      mockedId += 1;
      return mockedId.toString();
    },
  };
});

describe('Integrations between BlockProcessor and EditorController', () => {
  it('Computes the program from an editor change', async () => {
    const computer = getComputer();
    const controller = new EditorController('id', []);
    new BlockProcessor(controller, computer, 0);

    controller.forceNormalize();

    controller.apply({
      type: 'insert_node',
      path: [2, 0],
      node: {
        id: 'code-line-id',
        type: ELEMENT_CODE_LINE,
        children: [{ text: 'A = 5' }],
      } satisfies CodeLineElement,
    });

    // TODO: Change block processor to make it much more testable.
    await timeout(1000);

    expect(computer.getBlockIdResult('code-line-id')).toMatchObject({
      id: 'code-line-id',
      result: {
        type: {
          kind: 'number',
          unit: null,
        },
        value: {
          d: 1n,
          infinite: false,
          n: 5n,
          s: 1n,
        },
      },
      type: 'computer-result',
    });
  });

  it('Computes the program from the data tab', async () => {
    const computer = getComputer();
    const controller = new EditorController('id', []);
    new BlockProcessor(controller, computer, 0);

    controller.forceNormalize();

    controller.apply({
      type: 'insert_node',
      path: [1, 0],
      node: {
        id: 'calculation-1',
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [
          {
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: 'My Var Name' }],
          },
          {
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [{ text: '5' }],
          },
        ],
      } satisfies DataTabChildrenElement,
    });

    await timeout(1000);

    expect(computer.getBlockIdResult('calculation-1')).toMatchObject({
      id: 'calculation-1',
      result: {
        type: {
          kind: 'number',
          unit: null,
        },
        value: {
          d: 1n,
          infinite: false,
          n: 5n,
          s: 1n,
        },
      },
      type: 'computer-result',
      usedNames: [],
    });
  });
});
