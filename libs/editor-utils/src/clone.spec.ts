import { Computer } from '@decipad/computer';
import {
  ELEMENT_CODE_LINE,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_PARAGRAPH,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { clone } from '.';

jest.mock('nanoid', () => ({ nanoid: () => 'mock-nanoid' }));

let computer: Computer;
beforeEach(() => {
  computer = new Computer();
});

it('clones and uses a new nanoid', () => {
  expect(
    clone(computer, {
      type: ELEMENT_PARAGRAPH,
      id: 'old-id',
      children: [{ text: 'hello' }],
    })
  ).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "text": "hello",
        },
      ],
      "id": "mock-nanoid",
      "type": "p",
    }
  `);
});

it('clones while using a different varname', () => {
  expect(
    clone(computer, {
      type: ELEMENT_CODE_LINE,
      id: 'old-id',
      children: [{ text: 'hello = "world"' }],
    })
  ).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "text": "helloCopy = \\"world\\"",
        },
      ],
      "id": "mock-nanoid",
      "type": "code_line",
    }
  `);
});

it('clones while using a different varname (2)', () => {
  expect(
    clone(computer, {
      type: ELEMENT_CODE_LINE_V2,
      id: 'old-id',
      children: [
        {
          type: ELEMENT_STRUCTURED_VARNAME,
          id: 'var-id',
          children: [{ text: 'hello' }],
        },
        {
          type: ELEMENT_CODE_LINE_V2_CODE,
          id: 'code-id',
          children: [{ text: '"world"' }],
        },
      ],
    })
  ).toMatchInlineSnapshot(`
    Object {
      "children": Array [
        Object {
          "children": Array [
            Object {
              "text": "helloCopy",
            },
          ],
          "id": "mock-nanoid",
          "type": "structured_varname",
        },
        Object {
          "children": Array [
            Object {
              "text": "\\"world\\"",
            },
          ],
          "id": "mock-nanoid",
          "type": "code_line_v2_code",
        },
      ],
      "id": "mock-nanoid",
      "type": "code_line_v2",
    }
  `);
});
