import { nanoid } from 'nanoid';
import {
  ELEMENT_INTEGRATION,
  ImportElementSource,
  IntegrationTypes,
} from '@decipad/editor-types';
import { useCodeConnectionStore } from '@decipad/react-contexts';

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

      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: varName }],
        integrationType: {
          type: 'codeconnection',
          code: codeStore.code,
          latestResult: codeStore.latestResult,
        },
      };
    }

    default: {
      return {
        id: nanoid(),
        type: ELEMENT_INTEGRATION,
        children: [{ text: 'yoname' }],
        integrationType: {
          type: 'codeconnection',
          code: '',
          latestResult: '',
        },
      };
    }
  }
}
