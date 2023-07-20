/* eslint-disable no-param-reassign */
import { Result, mapResultType } from '@decipad/computer';
import { codePlaceholder } from '@decipad/config';
import {
  ImportElementSource,
  SimpleTableCellType,
} from '@decipad/editor-types';
import { generateVarName } from '@decipad/utils';
import { create } from 'zustand';

const IntegrationSteps = ['pick-integration', 'connect', 'map'] as const;
export type Stage = typeof IntegrationSteps[number];

export interface IntegrationStore {
  open: boolean;
  changeOpen: (v: boolean) => void;

  connectionType?: ImportElementSource;
  setConnectionType: (v: ImportElementSource | undefined) => void;

  stage: Stage;
  setStage: (v: Stage) => void;

  varName: string | undefined;
  setVarName: (v: string) => void;

  resultPreview?: Result.Result;
  setResultPreview: (v: Result.Result | undefined) => void;

  resultTypeMapping: Array<SimpleTableCellType | undefined>;
  // Index is the index of the column (or if not a column, then defaults to 0)
  setResultTypeMapping: (index: number, type: SimpleTableCellType) => void;
  setAllTypeMapping: (v: Array<SimpleTableCellType | undefined>) => void;
  applyTypeMapping: () => void;

  /** Method to move to the next stage (This changes depending on the type of integration) */
  next: () => void;
  /** Same as above, but to go back */
  back: () => void;

  /** Partially reset the store */
  abort: (keepOpen?: boolean) => void;

  // Used when the user has confirmed they want to create integration
  createIntegration: boolean;
  existingIntegration: string | undefined;
  setExistingIntegration: (v: string | undefined) => void;
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
  open: false,
  changeOpen(v) {
    set(() => ({ open: v }));
    if (!v) {
      get().abort();
    }
  },

  connectionType: undefined,
  setConnectionType: (v) => set(() => ({ connectionType: v })),

  stage: 'pick-integration',
  setStage: (v) => set(() => ({ stage: v })),

  varName: generateVarName(true),
  setVarName: (v) => set(() => ({ varName: v })),

  resultPreview: undefined,
  setResultPreview: (v) => set(() => ({ resultPreview: v })),

  resultTypeMapping: [],
  setResultTypeMapping(index, type) {
    const { resultTypeMapping, applyTypeMapping } = get();

    const clonedTypeMappings = [...resultTypeMapping];
    clonedTypeMappings[index] = type;

    set({ resultTypeMapping: clonedTypeMappings });
    applyTypeMapping();
  },
  setAllTypeMapping(types) {
    set({ resultTypeMapping: types });
  },

  applyTypeMapping() {
    const { resultPreview, resultTypeMapping } = get();
    if (!resultPreview) return;

    const mappedType = mapResultType(resultPreview, resultTypeMapping);
    set({ resultPreview: mappedType });
  },

  next() {
    const { stage, setStage } = get();

    const index = IntegrationSteps.indexOf(stage);
    if (index === -1) {
      throw new Error(
        `Could not find the current stage in IntegrationSteps: ${stage}`
      );
    }

    if (index === IntegrationSteps.length - 1) {
      // User clicked continue on last page, create integration.
      set(() => ({ createIntegration: true }));
    } else {
      setStage(IntegrationSteps[index + 1]);
    }
  },

  back() {
    const { stage, setStage, abort } = get();

    const index = IntegrationSteps.indexOf(stage);
    if (index === -1) {
      throw new Error(
        `Could not find the current stage in IntegrationSteps: ${stage}`
      );
    }

    if (index === 0) {
      abort(false);
    } else {
      setStage(IntegrationSteps[index - 1]);
    }
  },

  abort: (keepOpen = false) => {
    set(() => ({
      stage: 'pick-integration',
      open: keepOpen,
      connectionType: undefined,
      createIntegration: false,
      varName: generateVarName(true),
      resultPreview: undefined,
      existingIntegration: undefined,
      resultTypeMapping: [],
    }));

    // Reset dependent stores.
    useCodeConnectionStore.getState().reset();
    useSQLConnectionStore.getState().reset();
  },

  createIntegration: false,
  existingIntegration: undefined,
  setExistingIntegration: (v) => set(() => ({ existingIntegration: v })),
}));

interface ConnectionStore {
  /* Latest result from the connection, so we can fallback on it. */
  latestResult: string;
  timeOfLastRun: string | null;
}

interface CodeConnectionStore extends ConnectionStore {
  code: string;
  setCode: (newCode: string) => void;
  setLatestResult: (newResult: string) => void;

  reset: () => void;

  showAi: boolean;
  toggleShowAi: (b?: boolean) => void;
}

export const useCodeConnectionStore = create<CodeConnectionStore>((set) => ({
  code: codePlaceholder(),
  setCode: (v) => set(() => ({ code: v })),

  latestResult: '',
  setLatestResult: (v) =>
    set(() => {
      return { latestResult: v, timeOfLastRun: new Date().toISOString() };
    }),

  timeOfLastRun: null,

  reset: () =>
    set(() => ({
      code: codePlaceholder(),
      latestResult: '',
      timeOfLastRun: null,
    })),

  showAi: false,
  toggleShowAi: (b) =>
    set(({ showAi }) => ({ showAi: b === undefined ? !showAi : b })),
}));

interface SQLConnectionStore extends ConnectionStore {
  ExternalDataId: string | undefined;
  ExternalDataName: string | undefined;
  Query: string;

  reset: () => void;
  Set: (NewState: Partial<SQLConnectionStore>) => void;
}

export const useSQLConnectionStore = create<SQLConnectionStore>((set) => ({
  /* Generic Connection Fields */
  latestResult: '',
  timeOfLastRun: null,

  /* SQL Specific Fields */
  ExternalDataId: undefined,
  ExternalDataName: undefined,
  Query: '',

  reset() {
    set(() => ({
      Query: '',
      latestResult: '',
      timeOfLastRun: null,
      ExternalDataId: undefined,
      ExternalDataName: undefined,
    }));
  },

  Set(NewState) {
    set(() => NewState);
  },
}));
