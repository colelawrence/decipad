import { Computer } from '@decipad/computer-interfaces';
import { Filter, IntegrationTypes } from '@decipad/editor-types';
import { getRunner } from './runners';
import { getNodeString } from '@udecode/plate-common';
import { assert, timeout } from '@decipad/utils';
import {
  pushResultNameChange,
  pushResultToComputer,
} from '@decipad/computer-utils';
import { omit } from 'lodash';
import { EditorController } from '../EditorController';
import DeciNumber from '@decipad/number';

const WAIT_BEFORE_CHECKING_RESULT = 3000;

const hasValidResult = (computer: Computer, resultId: string): boolean => {
  const result = computer.getBlockIdResult(resultId);

  return result != null && result.type === 'computer-result';
};

const pushIntegration = async (
  notebookId: string,
  computer: Computer,
  block: IntegrationTypes.IntegrationBlock
): Promise<void> => {
  const variableName = getNodeString(block.children[0]);
  const { id, typeMappings, filters } = block;

  const hydratedFilters = (filters ?? []).map((filter): Filter => {
    if (filter.type === 'number') {
      return { ...filter, value: new DeciNumber(filter.value) };
    }
    return filter;
  });

  const runner = getRunner({
    id,
    computer,
    notebookId,
    integration: block,
    integrationType: undefined,
    name: variableName,
    types: typeMappings,
    filters: hydratedFilters,
  });

  await runner.import(computer).catch((err) => {
    console.error('error importing:', err);
    // TODO: error handling in the runner
    throw err;
  });
  runner.clean();
};

export const removeFromComputer =
  (computer: Computer) => (block: IntegrationTypes.IntegrationBlock) => {
    const variableName = getNodeString(block.children[0]);
    pushResultToComputer(computer, block.id, variableName, undefined);
  };

export const renameResultInComputer =
  (notebookId: string, computer: Computer) =>
  async (block: IntegrationTypes.IntegrationBlock) => {
    const newVariableName = getNodeString(block.children[0]);
    const computerResult = computer.getBlockIdResult(block.id);
    assert(
      computerResult != null,
      "Result should be defined, if you're trying to rename it."
    );

    if (
      computerResult.type === 'identified-error' ||
      computerResult.result.type.kind !== 'table'
    ) {
      // Try to push the result again if we have an error.
      // Or if we have a simple result (like a single value, or column).
      await pushIntegration(notebookId, computer, block);
      return;
    }

    pushResultNameChange(computer, block.id, newVariableName, {
      type: 'table',
      columnsToHide: Object.entries(block.typeMappings)
        .filter(([, type]) => type?.isHidden)
        .map(([name]) => name),
      columnNameToIds: Object.fromEntries(
        Object.entries(block.typeMappings)
          .map(([name, t]) =>
            t?.desiredName == null
              ? undefined
              : ([t.desiredName, name] as const)
          )
          .filter((i): i is [string, string] => i != null)
      ),
    });
  };

export const withControllerSideEffects = (
  controller: EditorController,
  callback: (block: IntegrationTypes.IntegrationBlock) => string
): ((block: IntegrationTypes.IntegrationBlock) => string) => {
  return (block) => {
    const timeOfLastRun = callback(block);

    if (timeOfLastRun === block.timeOfLastRun) {
      return timeOfLastRun;
    }

    const entry = controller.findNodeEntryById(block.id);
    assert(entry != null, 'dont expect entry to be null.');

    const [, path] = entry;

    controller.apply({
      type: 'set_node',
      properties: omit(block, 'children'),
      newProperties: { ...omit(block, 'children'), timeOfLastRun },
      path,
    });

    return timeOfLastRun;
  };
};

export const withComputerCacheIntegration = (
  notebookId: string,
  computer: Computer
): ((block: IntegrationTypes.IntegrationBlock) => string) => {
  let hasTriedCache = false;

  const blocksToProcess = new Map<string, IntegrationTypes.IntegrationBlock>();

  computer
    .waitForTriedCache()
    .then(() => timeout(WAIT_BEFORE_CHECKING_RESULT))
    .finally(() => {
      for (const block of blocksToProcess.values()) {
        if (hasValidResult(computer, block.id)) {
          continue;
        }

        pushIntegration(notebookId, computer, block);
      }

      blocksToProcess.clear();
      hasTriedCache = true;
    });

  return (block: IntegrationTypes.IntegrationBlock) => {
    if (!hasTriedCache) {
      blocksToProcess.set(block.id, block);
      return block.timeOfLastRun ?? Date.now().toString();
    }

    if (block.timeOfLastRun == null && hasValidResult(computer, block.id)) {
      // This is the first time the block has been inserted.
      // Let's check if we have a valid result. If so, we
      // shouldn't re-import.

      return Date.now().toString();
    }

    pushIntegration(notebookId, computer, block);

    return Date.now().toString();
  };
};

type IntegrationManagerReturn = {
  insertIntegration: (block: IntegrationTypes.IntegrationBlock) => void;
  removeIntegration: (block: IntegrationTypes.IntegrationBlock) => void;
};

export const createIntegrationManager = (
  insertIntegration: (block: IntegrationTypes.IntegrationBlock) => string,
  renameIntegration: (block: IntegrationTypes.IntegrationBlock) => void,
  deleteIntegration: (block: IntegrationTypes.IntegrationBlock) => void
): IntegrationManagerReturn => {
  const integrationIdToLastRanTime = new Map<string, string>();
  const integrationIdToName = new Map<string, string>();

  return {
    insertIntegration(block: IntegrationTypes.IntegrationBlock) {
      const lastRanTime = integrationIdToLastRanTime.get(block.id);
      const lastSeenName = integrationIdToName.get(block.id);

      const blockName = getNodeString(block.children[0]);

      if (
        lastRanTime === block.timeOfLastRun &&
        lastSeenName === getNodeString(block.children[0])
      ) {
        return;
      }

      if (lastRanTime !== block.timeOfLastRun || block.timeOfLastRun == null) {
        const timeOfLastRun = insertIntegration(block);
        integrationIdToLastRanTime.set(block.id, timeOfLastRun);

        if (lastSeenName !== blockName) {
          integrationIdToName.set(block.id, blockName);
        }

        return;
      }

      if (lastSeenName !== blockName) {
        renameIntegration(block);
        integrationIdToName.set(block.id, blockName);
      }
    },

    removeIntegration(block) {
      integrationIdToLastRanTime.delete(block.id);
      integrationIdToName.delete(block.id);

      deleteIntegration(block);
    },
  };
};
