import { describe, it, expect, beforeEach } from 'vitest';
import {
  createIntegrationManager,
  debounceWithLeading,
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
import { Computer, getComputer, parseBlockOrThrow } from '@decipad/computer';
import { concatMap, delay, merge, Observable, of, Subject } from 'rxjs';
import { TestScheduler } from 'rxjs/testing';

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

describe('Variable change computer observable', () => {
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

  let computer = getComputer();

  beforeEach(() => {
    computer = getComputer();
  });

  it('emits event when variable changes', async () => {
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

    const usedVariablesGetter = getUsedVariables(computer, 'notebook-id');
    const observable = getVariableChangeObservable(
      usedVariablesGetter,
      computer
    );

    let counter = 0;
    const sub = observable(integrationBlock).subscribe(() => {
      counter++;
    });

    expect(counter).toBe(0);

    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: 'id',
            type: 'identified-block',
            block: parseBlockOrThrow('Variable = 6', 'id'),
          },
        ],
      },
    });

    expect(counter).toBe(1);

    sub.unsubscribe();
  });

  it('doesnt re-emit if that variable has stayed the same', async () => {
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

    const usedVariablesGetter = getUsedVariables(computer, 'notebook-id');
    const observable = getVariableChangeObservable(
      usedVariablesGetter,
      computer
    );

    let counter = 0;
    const sub = observable(integrationBlock).subscribe(() => {
      counter++;
    });

    expect(counter).toBe(0);

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

    expect(counter).toBe(1);

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

    expect(counter).toBe(1);

    sub.unsubscribe();
  });

  it('does re-emit if the variable has changed', async () => {
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

    const usedVariablesGetter = getUsedVariables(computer, 'notebook-id');
    const observable = getVariableChangeObservable(
      usedVariablesGetter,
      computer
    );

    let counter = 0;
    const sub = observable(integrationBlock).subscribe(() => {
      counter++;
    });

    expect(counter).toBe(0);

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

    expect(counter).toBe(1);

    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: 'id',
            type: 'identified-block',
            block: parseBlockOrThrow('Variable = 6', 'id'),
          },
        ],
      },
    });

    expect(counter).toBe(2);

    sub.unsubscribe();
  });

  it('only emits one event if multiple variables are emitted at once', async () => {
    assert(integrationBlock.integrationType.type === 'mysql');
    integrationBlock.integrationType.query = '{{Variable}} {{Variable2}}';

    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: 'id',
            type: 'identified-block',
            block: parseBlockOrThrow('Variable = 5', 'id'),
          },
          {
            id: 'id-2',
            type: 'identified-block',
            block: parseBlockOrThrow('Variable2 = 5', 'id'),
          },
        ],
      },
    });

    const usedVariablesGetter = getUsedVariables(computer, 'notebook-id');
    const observable = getVariableChangeObservable(
      usedVariablesGetter,
      computer
    );

    let counter = 0;
    const sub = observable(integrationBlock).subscribe(() => {
      counter++;
    });

    expect(counter).toBe(0);

    await computer.pushComputeDelta({
      program: {
        upsert: [
          {
            id: 'id',
            type: 'identified-block',
            block: parseBlockOrThrow('Variable = 5', 'id'),
          },
          {
            id: 'id-2',
            type: 'identified-block',
            block: parseBlockOrThrow('Variable2 = 5', 'id'),
          },
        ],
      },
    });

    expect(counter).toBe(1);

    sub.unsubscribe();
  });

  // I want
  // - First event to be instant.
  // - Any subsequent event to have to wait 1 or so second.
  it('observable that throttles first and debounces', async () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });

    const other = of('d').pipe(delay(15));
    const otherother = of('e').pipe(delay(40));
    const observable = merge(of('a', 'b', 'c'), other, otherother).pipe(
      debounceWithLeading(10)
    );

    scheduler.run((helpers) => {
      const { expectObservable } = helpers;

      //
      // There is a bit to understand about this testing syntax.
      // @see https://rxjs.dev/guide/testing/marble-testing
      //
      // Basically, you write the value of the events emitted, delay between them,
      // and a group (brackets), and a pipe (|) to indicate the end of the observable.
      //

      //
      // Here we can see that we wait the debounce time necessary,
      // but revert back to throttling (emitting instantly), when
      // the delay is over.
      //

      const expected = 'a 9ms c 4ms d 24ms e';

      expectObservable(observable).toBe(expected);
    });
  });

  it('waits until very last event to emit', async () => {
    const scheduler = new TestScheduler((actual, expected) => {
      expect(actual).deep.equal(expected);
    });

    const delayed = of('a', 'b', 'c', 'd', 'e', 'f').pipe(
      concatMap((v) => of(v).pipe(delay(5)))
    );
    const observable = delayed.pipe(debounceWithLeading(10));

    scheduler.run((helpers) => {
      const { expectObservable } = helpers;

      //
      // There is a bit to understand about this testing syntax.
      // @see https://rxjs.dev/guide/testing/marble-testing
      //
      // Basically, you write the value of the events emitted, delay between them,
      // and a group (brackets), and a pipe (|) to indicate the end of the observable.
      //

      //
      // Here we can see that we wait the debounce time necessary,
      // but revert back to throttling (emitting instantly), when
      // the delay is over.
      //

      const expected = '5ms a 34ms f';

      expectObservable(observable).toBe(expected);
    });
  });
});
