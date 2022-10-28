import { Computer } from '@decipad/computer';
import {
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  VariableDefinitionElement,
  ELEMENT_SLIDER,
  MyEditor,
} from '@decipad/editor-types';
import { astNode } from '@decipad/editor-utils';
import { toFraction } from '@decipad/fraction';
import { createPlateEditor } from '@udecode/plate';
import { VariableDef } from './VariableDef';

describe('VariableDef expression element', () => {
  it('converts variable def expression document element into name and expression', async () => {
    const editor = createPlateEditor() as MyEditor;
    const el = {
      id: 'id0',
      type: ELEMENT_VARIABLE_DEF,
      variant: 'expression',
      children: [
        {
          id: 'id1',
          type: ELEMENT_CAPTION,
          children: [{ text: 'varName' }],
          icon: 'Frame',
          color: 'Sulu',
        },
        {
          id: 'id2',
          type: ELEMENT_EXPRESSION,
          children: [{ text: 'expression' }],
        },
      ],
    } as VariableDefinitionElement;
    expect(
      (
        await VariableDef.getParsedBlockFromElement?.(
          editor,
          new Computer(),
          el
        )
      )?.[0].block?.args
    ).toMatchObject([
      astNode(
        'assign',
        astNode('def', 'varName'),
        astNode('ref', 'expression')
      ),
    ]);
  });
});

describe('VariableDef slider element', () => {
  const editor = createPlateEditor() as MyEditor;
  it('converts variable def slider document element into name and expression', async () => {
    const el = {
      id: 'id0',
      type: ELEMENT_VARIABLE_DEF,
      variant: 'slider',
      children: [
        {
          id: 'id1',
          type: ELEMENT_CAPTION,
          children: [{ text: 'varName' }],
          icon: 'Frame',
          color: 'Sulu',
        },
        {
          id: 'id3',
          type: ELEMENT_EXPRESSION,
          children: [{ text: '5' }],
        },
        {
          id: 'id2',
          type: ELEMENT_SLIDER,
          value: '5',
          max: '10',
          min: '0',
          step: '0.1',
          children: [{ text: '' }],
        },
      ],
    } as VariableDefinitionElement;
    expect(
      (
        await VariableDef.getParsedBlockFromElement?.(
          editor,
          new Computer(),
          el
        )
      )?.[0].block?.args
    ).toMatchObject([
      astNode(
        'assign',
        astNode('def', 'varName'),
        astNode('literal', 'number', toFraction(5))
      ),
    ]);
  });
});
