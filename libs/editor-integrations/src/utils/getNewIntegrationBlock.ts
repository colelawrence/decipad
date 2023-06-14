import {
  ELEMENT_INTEGRATION,
  ImportElementSource,
  IntegrationTypes,
} from '@decipad/editor-types';
import {
  useCodeConnectionStore,
  useConnectionStore,
} from '@decipad/react-contexts';
import { nanoid } from 'nanoid';

/**
 * Helper function to return the correct new integration,
 * with the correct state.
 *
 * Zustand stores can be accessed outside react so this makes the whole process
 * much nicer.
 */
export function getNewIntegration(
  type: ImportElementSource,
  varName: string
): IntegrationTypes.IntegrationBlock {
  switch (type) {
    case 'codeconnection': {
      const codeStore = useCodeConnectionStore.getState();
      const store = useConnectionStore.getState();

      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: varName }],
        typeMappings: store.resultTypeMapping,
        integrationType: {
          type: 'codeconnection',
          code: codeStore.code,
          latestResult: codeStore.latestResult,
          timeOfLastRun: codeStore.timeOfLastRun,
        },
      };
    }

    default: {
      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: 'yoname' }],
        typeMappings: [],
        integrationType: {
          type: 'codeconnection',
          code: '',
          latestResult: '',
          timeOfLastRun: null,
        },
      };
    }
  }
}
