import { describe, it, expect, beforeEach } from 'vitest';
import {
  createIntegrationManager,
  withControllerSideEffects,
} from './integrations';
import { EditorController } from '../EditorController';
import { FIRST_TAB_INDEX } from '../constants';
import { ELEMENT_INTEGRATION, IntegrationTypes } from '@decipad/editor-types';

describe('Inserting / Updating intergrations', () => {
  it("performs an action if integration hasn't been ran before", () => {
    const blockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      () => {},
      () => {}
    );

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: Date.now().toString(),
      children: [{ text: 'name' }],
    } as any);

    expect(blockIds).toMatchObject(['my-block-id']);
  });

  it("doesn't perform an action if the timeOfLastRun is the same", () => {
    const blockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      () => {},
      () => {}
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

  it('re-runs action if timeOfLastRun changes', () => {
    const blockIds: Array<string> = [];

    const { insertIntegration } = createIntegrationManager(
      (block) => {
        blockIds.push(block.id);
        return Date.now().toString();
      },
      () => {},
      () => {}
    );

    // Run it once to get the Map inside `createIntegrationManager` up to date.
    const date = Date.now();

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: date.toString(),
      children: [{ text: 'name' }],
    } as any);
    expect(blockIds).toMatchObject(['my-block-id']);

    const newDate = date + 1000;

    insertIntegration({
      id: 'my-block-id',
      timeOfLastRun: newDate.toString(),
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
      () => {}
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
});

describe('Interaction with EditorController', () => {
  let controller = new EditorController('id', []);
  const integrationBlock: IntegrationTypes.IntegrationBlock = {
    id: '1',
    type: ELEMENT_INTEGRATION,
    children: [{ text: 'name ' }],
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
