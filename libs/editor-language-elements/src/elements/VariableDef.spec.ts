import { getRemoteComputer } from '@decipad/remote-computer';
import type { VariableDefinitionElement } from '@decipad/editor-types';
import {
  ELEMENT_VARIABLE_DEF,
  ELEMENT_CAPTION,
  ELEMENT_EXPRESSION,
  ELEMENT_SLIDER,
} from '@decipad/editor-types';
import { astNode } from '@decipad/editor-utils';
import { N } from '@decipad/number';
import { VariableDef } from './VariableDef';
import { createTestEditorController } from '../testEditorController';

describe('VariableDef expression element', () => {
  it('converts variable def expression document element into name and expression', async () => {
    const editor = createTestEditorController('id');
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
          getRemoteComputer(),
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
  const editor = createTestEditorController('id');
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
          getRemoteComputer(),
          el
        )
      )?.[0].block?.args
    ).toMatchObject([
      astNode(
        'assign',
        astNode('def', 'varName'),
        astNode('literal', 'number', N(5))
      ),
    ]);
  });
});
