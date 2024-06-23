/* eslint-disable no-param-reassign */
import { create } from 'zustand';
import type { Result } from '@decipad/language-interfaces';
import type {
  ImportElementSource,
  IntegrationTypes,
  SimpleTableCellType,
} from '@decipad/editor-types';
import { generatedNames } from '@decipad/utils';

const IntegrationSteps = ['pick-integration', 'connect', 'map'] as const;
export type Stage = typeof IntegrationSteps[number];

export function getConnectionDisplayLabel(
  integrationType: ImportElementSource | undefined
): string {
  switch (integrationType) {
    case 'notion':
      return 'Connection';
    default:
      return 'Code';
  }
}

export interface IntegrationStore {
  stage: Stage;
  connectionType: ImportElementSource | undefined;

  varName: string;
  rawResult: string | undefined;
  resultPreview: Result.Result | undefined;

  timeOfLastRun: string | undefined;

  columnsToHide: Array<string>;

  next: () => void;
  back: () => void;
  abort: (keepOpen?: boolean) => void;

  // Used when the user has confirmed they want to create integration
  createIntegration: boolean;
  existingIntegration: string | undefined;

  existingIntegrationOptions: IntegrationTypes.IntegrationBlock | undefined;

  typeMapping: Array<SimpleTableCellType | undefined> | undefined;

  Set: (
    state: Partial<
      Pick<
        IntegrationStore,
        | 'connectionType'
        | 'stage'
        | 'varName'
        | 'rawResult'
        | 'resultPreview'
        | 'createIntegration'
        | 'existingIntegration'
        | 'columnsToHide'
        | 'typeMapping'
        | 'existingIntegrationOptions'
      >
    >
  ) => void;
}

export type EasyExternalDataProps = {
  editorId: string;
  url: string;
  provider: ImportElementSource;
};

/**
 * Returns the zustand store for the data integrations creation.
 *
 * The store handles connection options, errors and current stages of the modal.
 *
 * @stage -> Which part of the modal should you click? And what should the 'connect' button do.
 */
export const useConnectionStore = create<IntegrationStore>((set, get) => ({
  Set(state) {
    set(() => state);
  },

  stage: 'pick-integration',
  connectionType: undefined,

  timeOfLastRun: undefined,

  existingIntegrationOptions: undefined,

  varName: generatedNames(),
  rawResult: undefined,
  resultPreview: undefined,

  typeMapping: undefined,
  columnsToHide: [],

  next() {
    const { stage } = get();

    const index = IntegrationSteps.indexOf(stage);
    if (index === -1) {
      throw new Error(
        `Could not find the current stage in IntegrationSteps: ${stage}`
      );
    }

    if (index === IntegrationSteps.length - 1) {
      // User clicked continue on last page, create integration.
      set({ createIntegration: true });
    } else {
      set({ stage: IntegrationSteps[index + 1] });
    }
  },

  back() {
    const { stage, abort } = get();

    const index = IntegrationSteps.indexOf(stage);
    if (index === -1) {
      throw new Error(
        `Could not find the current stage in IntegrationSteps: ${stage}`
      );
    }

    if (index === 0) {
      abort(false);
    } else {
      set({ stage: IntegrationSteps[index - 1] });
    }
  },

  abort: () => {
    set({
      stage: 'pick-integration',
      connectionType: undefined,
      createIntegration: false,
      varName: generatedNames(),
      resultPreview: undefined,
      existingIntegration: undefined,
      columnsToHide: [],
    });
  },

  createIntegration: false,
  existingIntegration: undefined,
}));
