import { vi, expect, describe, it } from 'vitest';
/* eslint-disable no-new */
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
import { Computer, IdentifiedResult } from '@decipad/computer-interfaces';

vi.mock('nanoid', () => {
  let mockedId = 0;
  return {
    nanoid: () => {
      mockedId += 1;
      return mockedId.toString();
    },
  };
});

const promisifyBlockId =
  (computer: Computer) =>
  (id: string): Promise<IdentifiedResult> => {
    return new Promise((resolve, reject) => {
      const sub = computer.getBlockIdResult$.observe(id).subscribe((res) => {
        if (res == null) {
          return;
        }

        if (res.type === 'identified-error') {
          sub.unsubscribe();
          reject();
          return;
        }

        if (
          res.type === 'computer-result' &&
          res.result.type.kind === 'pending'
        ) {
          return;
        }

        sub.unsubscribe();
        resolve(res);
      });
    });
  };

describe('Integrations between BlockProcessor and EditorController', () => {
  it('Computes the program from an editor change', async () => {
    const computer = getComputer();
    const controller = new EditorController('id', []);
    new BlockProcessor(controller, computer, 'id', 0);

    const getResult = promisifyBlockId(computer);

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

    await expect(getResult('code-line-id')).resolves.toMatchObject({
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
    new BlockProcessor(controller, computer, 'id', 0);

    const getResult = promisifyBlockId(computer);

    controller.forceNormalize();

    controller.apply({
      type: 'insert_node',
      path: [1, 0],
      node: {
        id: 'calculation-1',
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: [
          {
            id: 'calc-name-1',
            type: ELEMENT_STRUCTURED_VARNAME,
            children: [{ text: 'My Var Name' }],
          },
          {
            id: 'calc-code-1',
            type: ELEMENT_CODE_LINE_V2_CODE,
            children: [{ text: '5' }],
          },
        ],
      } satisfies DataTabChildrenElement,
    });

    await expect(getResult('calculation-1')).resolves.toMatchObject({
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
