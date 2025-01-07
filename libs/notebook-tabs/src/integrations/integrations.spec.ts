import { describe, it, expect, beforeEach } from 'vitest';
import {
  createIntegrationManager,
  withControllerSideEffects,
} from './integrations';
import { EditorController } from '../EditorController';
import { FIRST_TAB_INDEX } from '../constants';
import {
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_VARNAME,
  ELEMENT_TABLE_COLUMN_FORMULA,
  IntegrationTypes,
  TableColumnFormulaElement,
} from '@decipad/editor-types';
import { noop } from '@decipad/utils';

describe('Inserting / Updating intergrations', () => {
  it("performs an action if integration hasn't been ran before", () => {
    const blockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      noop,
      noop,
      noop,
      noop
    );

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: Date.now().toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
  });

  it("doesn't perform an action if the timeOfLastRun is defined", () => {
    const blockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      noop,
      noop,
      noop,
      noop
    );

    // Run it once to get the Map inside `createIntegrationManager` up to date.

    const date = Date.now().toString();

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date,
      children: [{ text: 'name' }],
    } as any);
    expect(blockIds).toMatchObject(['my-block-id']);

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date,
      children: [{ text: 'name' }],
    } as any);
    expect(blockIds).toMatchObject(['my-block-id']);
  });

  it('re-runs action if timeOfLastRun becomes null again', () => {
    const blockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      noop,
      noop,
      noop,
      noop
    );

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: null,
      children: [{ text: 'name' }],
    } as any);
    expect(blockIds).toMatchObject(['my-block-id']);

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: null,
      children: [{ text: 'name' }],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id', 'my-block-id']);
  });

  it('can rename the integration', () => {
    const blockIds: Array<string> = [];
    const renamingBlockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      (block) => {
        renamingBlockIds.push(block.id);
      },
      noop,
      noop,
      noop
    );

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(renamingBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'new-name' }],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
    expect(renamingBlockIds).toMatchObject(['my-block-id']);
  });

  it('can update formulas', () => {
    const blockIds: Array<string> = [];
    const updatedFormulasBlockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      noop,
      (block) => {
        updatedFormulasBlockIds.push(block.id);
      },
      noop,
      noop
    );

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(updatedFormulasBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [
        { text: 'new-name' },
        {
          id: 'formula-1',
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          columnId: 'formula-1',
          children: [{ text: '1+1' }],
        } satisfies TableColumnFormulaElement,
      ],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
    expect(updatedFormulasBlockIds).toMatchObject(['my-block-id']);
  });

  it('re-runs formulas if varName changes', () => {
    const blockIds: Array<string> = [];
    const updatedFormulasBlockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      noop,
      (block) => {
        updatedFormulasBlockIds.push(block.id);
      },
      noop,
      noop
    );

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(updatedFormulasBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [
        { text: 'new-name' },
        {
          id: 'formula-1',
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          columnId: 'formula-1',
          varName: 'name',
          children: [{ text: '1+1' }],
        } satisfies TableColumnFormulaElement,
      ],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
    expect(updatedFormulasBlockIds).toMatchObject(['my-block-id']);

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [
        { text: 'new-name' },
        {
          id: 'formula-1',
          type: ELEMENT_TABLE_COLUMN_FORMULA,
          columnId: 'formula-1',
          varName: 'name-changed',
          children: [{ text: '1+1' }],
        } satisfies TableColumnFormulaElement,
      ],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
    expect(updatedFormulasBlockIds).toMatchObject([
      'my-block-id',
      'my-block-id',
    ]);
  });

  it('updates when column types change', () => {
    const blockIds: Array<string> = [];
    const updatedColumnBlockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      noop,
      noop,
      (block) => {
        updatedColumnBlockIds.push(block.id);
      },
      noop
    );

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
      typeMappings: { col1: { type: { kind: 'number' } } },
    } as any);

    expect(updatedColumnBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
      typeMappings: { col1: { type: { kind: 'string' } } },
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
    expect(updatedColumnBlockIds).toMatchObject(['my-block-id']);
  });
});

describe('Interaction with EditorController', () => {
  let controller = new EditorController('id', []);
  const integrationBlock: IntegrationTypes.IntegrationBlock = {
    id: '1',
    type: ELEMENT_INTEGRATION,
    children: [
      {
        type: ELEMENT_STRUCTURED_VARNAME,
        id: '1-1',
        children: [{ text: 'name ' }],
      },
    ],
    timeOfLastRun: 'oldTimeOfLastRun',
    typeMappings: {},
    integrationType: { type: 'csv', csvUrl: 'some-url' },
    isFirstRowHeader: true,
  };

  beforeEach(() => {
    controller = new EditorController('id', []);
    controller.forceNormalize();
    controller.apply({
      type: 'insert_node',
      node: integrationBlock,
      path: [FIRST_TAB_INDEX, 0],
    });
  });

  it('sets correct timeOfLastRun', () => {
    const callback = withControllerSideEffects(
      controller,
      () => 'newTimeOfLastRun'
    );

    expect(controller.children[FIRST_TAB_INDEX].children[0].timeOfLastRun).toBe(
      'oldTimeOfLastRun'
    );

    callback(integrationBlock);

    expect(controller.children[FIRST_TAB_INDEX].children[0].timeOfLastRun).toBe(
      'newTimeOfLastRun'
    );
  });
});
