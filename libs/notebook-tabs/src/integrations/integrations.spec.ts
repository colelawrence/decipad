import { describe, it, expect, beforeEach } from 'vitest';
import {
  createIntegrationManager,
  getUsedVariables,
  getVariableChangeObservable,
  withControllerSideEffects,
  withVariableDependencies,
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
import { assert, noop } from '@decipad/utils';
import { Computer, parseBlockOrThrow } from '@decipad/computer';
import { Observable, Subject } from 'rxjs';

describe('Inserting / Updating intergrations', () => {
  it("performs an action if integration hasn't been ran before", () => {
    const blockIds: Array<string> = [];

    const { upsertIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      renameIntegration: noop,
      updateFormulas: noop,
      updateColumns: noop,
      deleteIntegration: noop,
    });

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: Date.now().toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
  });

  it("doesn't perform an action if the timeOfLastRun is defined", () => {
    const blockIds: Array<string> = [];

    const { upsertIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      renameIntegration: noop,
      updateFormulas: noop,
      updateColumns: noop,
      deleteIntegration: noop,
    });

    // Run it once to get the Map inside `createIntegrationManager` up to date.

    const date = Date.now().toString();

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date,
      children: [{ text: 'name' }],
    } as any);
    expect(blockIds).toMatchObject(['my-block-id']);

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date,
      children: [{ text: 'name' }],
    } as any);
    expect(blockIds).toMatchObject(['my-block-id']);
  });

  it('re-runs action if timeOfLastRun becomes null again', () => {
    const blockIds: Array<string> = [];

    const { upsertIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      renameIntegration: noop,
      updateFormulas: noop,
      updateColumns: noop,
      deleteIntegration: noop,
    });

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: null,
      children: [{ text: 'name' }],
    } as any);
    expect(blockIds).toMatchObject(['my-block-id']);

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: null,
      children: [{ text: 'name' }],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id', 'my-block-id']);
  });

  it('can rename the integration', () => {
    const blockIds: Array<string> = [];
    const renamingBlockIds: Array<string> = [];

    const { upsertIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      renameIntegration: (block) => {
        renamingBlockIds.push(block.id);
      },
      updateFormulas: noop,
      updateColumns: noop,
      deleteIntegration: noop,
    });

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(renamingBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    upsertIntegration({
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

    const { upsertIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      renameIntegration: noop,
      updateFormulas: (block) => {
        updatedFormulasBlockIds.push(block.id);
      },
      updateColumns: noop,
      deleteIntegration: noop,
    });

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(updatedFormulasBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    upsertIntegration({
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

    const { upsertIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      renameIntegration: noop,
      updateFormulas: (block) => {
        updatedFormulasBlockIds.push(block.id);
      },
      updateColumns: noop,
      deleteIntegration: noop,
    });

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(updatedFormulasBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    upsertIntegration({
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

    upsertIntegration({
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

    const { upsertIntegration } = createIntegrationManager({
      insertIntegration: (block) => {
        blockIds.push(block.id);
        return block.timeOfLastRun!;
      },
      renameIntegration: noop,
      updateFormulas: noop,
      updateColumns: (block) => {
        updatedColumnBlockIds.push(block.id);
      },
      deleteIntegration: noop,
    });

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now() - 1000;

    upsertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
      typeMappings: { col1: { type: { kind: 'number' } } },
    } as any);

    expect(updatedColumnBlockIds).toMatchObject([]);
    expect(blockIds).toMatchObject(['my-block-id']);

    upsertIntegration({
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

describe('Variable change management', () => {
  const integrationBlock: IntegrationTypes.IntegrationBlock = {
    id: 'id',
    type: ELEMENT_INTEGRATION,
    typeMappings: {},
    children: [
      {
        id: 'id',
        type: ELEMENT_STRUCTURED_VARNAME,
        children: [{ text: 'varname' }],
      },
    ],
    filters: [],
    timeOfLastRun: undefined,
    integrationType: {
      type: 'mysql',
      url: 'url',
      query: '',
    },
    isFirstRowHeader: false,
  };

  it('doesnt update the integration if no variable exists', () => {
    const blockIds: Array<string> = [];

    const { updateIntegration } = withVariableDependencies({
      upsertIntegration(block) {
        blockIds.push(block.id);
      },
      getVariablesUsed() {
        return new Set();
      },
      getDependencyObservable() {
        return new Observable();
      },
    });

    assert(integrationBlock.integrationType.type === 'mysql');
    integrationBlock.integrationType.query = '';

    updateIntegration(integrationBlock);

    expect(blockIds).toHaveLength(0);
  });

  it('doesnt run instantly even if variables are present', async () => {
    const blockIds: Array<string> = [];

    const { updateIntegration } = withVariableDependencies({
      upsertIntegration(block) {
        blockIds.push(block.id);
      },
      getVariablesUsed() {
        return new Set(['Variable']);
      },
      getDependencyObservable() {
        return new Observable();
      },
    });

    updateIntegration(integrationBlock);

    expect(blockIds).toHaveLength(0);
  });

  it('re-runs integration if variable changes', async () => {
    const blockIds: Array<string> = [];

    const subject = new Subject<undefined>();

    const { updateIntegration } = withVariableDependencies({
      upsertIntegration(block) {
        blockIds.push(block.id);
      },
      getVariablesUsed() {
        return new Set(['Variable']);
      },
      getDependencyObservable() {
        return subject.asObservable();
      },
    });

    updateIntegration(integrationBlock);
    expect(blockIds).toHaveLength(0);

    subject.next(undefined);

    expect(blockIds).toHaveLength(1);
  });

  it('doesnt create a new subscription if the variables dont change', async () => {
    const blockIds: Array<string> = [];

    const subject = new Subject<undefined>();

    const { updateIntegration, _integrationToSubscriptions } =
      withVariableDependencies({
        upsertIntegration(block) {
          blockIds.push(block.id);
        },
        getVariablesUsed() {
          return new Set(['Variable']);
        },
        getDependencyObservable() {
          return subject.asObservable();
        },
      });

    updateIntegration(integrationBlock);
    expect(blockIds).toHaveLength(0);

    const originalSubscription = _integrationToSubscriptions.get(
      integrationBlock.id
    )!;

    updateIntegration(integrationBlock);
    expect(blockIds).toHaveLength(0);

    expect(_integrationToSubscriptions.get(integrationBlock.id)).toBe(
      originalSubscription
    );
    expect(
      _integrationToSubscriptions.get(integrationBlock.id)?.variablesUsed
    ).toBe(originalSubscription.variablesUsed);
    expect(
      _integrationToSubscriptions.get(integrationBlock.id)?.subscription
    ).toBe(originalSubscription.subscription);
  });

  it('removes subscription if variables are no longer used', async () => {
    const blockIds: Array<string> = [];

    let called = false;
    const subject = new Subject<undefined>();

    const { updateIntegration, _integrationToSubscriptions } =
      withVariableDependencies({
        upsertIntegration(block) {
          blockIds.push(block.id);
        },
        getVariablesUsed() {
          if (!called) {
            return new Set(['Variable']);
          }

          return new Set();
        },
        getDependencyObservable() {
          return subject.asObservable();
        },
      });

    updateIntegration(integrationBlock);
    expect(blockIds).toHaveLength(0);

    called = true;

    updateIntegration(integrationBlock);
    expect(_integrationToSubscriptions.size).toBe(0);
  });

  it('integrates with the computer', async () => {
    const blockIds: Array<string> = [];

    const computer = new Computer();
    const usedVariablesGetter = getUsedVariables(computer, 'notebook-id');

    const { updateIntegration, _integrationToSubscriptions } =
      withVariableDependencies({
        upsertIntegration(block) {
          blockIds.push(block.id);
        },
        getVariablesUsed(block) {
          return new Set(usedVariablesGetter(block));
        },
        getDependencyObservable(block) {
          return getVariableChangeObservable(
            usedVariablesGetter,
            computer
          )(block);
        },
      });

    assert(integrationBlock.integrationType.type === 'mysql');
    integrationBlock.integrationType.query = '{{Variable}}';

    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: 'id',
            type: 'identified-block',
            block: parseBlockOrThrow('Variable = 5', 'id'),
          },
        ],
      },
    });

    updateIntegration(integrationBlock);
    expect(blockIds).toHaveLength(0);

    assert(integrationBlock.integrationType.type === 'mysql');
    integrationBlock.integrationType.query = 'no variables used';

    updateIntegration(integrationBlock);
    expect(_integrationToSubscriptions.size).toBe(0);
  });
});
