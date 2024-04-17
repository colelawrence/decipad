/* eslint-disable no-param-reassign */
import { create } from 'zustand';
import type { Result } from '@decipad/remote-computer';
import { codePlaceholder } from '@decipad/frontend-config';
import type {
  ImportElementSource,
  SimpleTableCellType,
} from '@decipad/editor-types';
import { generateVarName } from '@decipad/utils';
import { importFromJSONAndCoercions, importFromNotion } from '@decipad/import';
import { Subject } from 'rxjs';

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
  open: boolean;
  changeOpen: (v: boolean) => void;

  stage: Stage;

  connectionType: ImportElementSource | undefined;
  varName: string | undefined;
  rawResult: string | undefined;
  resultPreview: Result.Result | undefined;
  resultTypeMapping: Array<SimpleTableCellType | undefined>;

  // Index is the index of the column (or if not a column, then defaults to 0)
  setResultTypeMapping: (index: number, type: SimpleTableCellType) => void;
  setAllTypeMapping: (v: Array<SimpleTableCellType | undefined>) => void;

  /** Method to move to the next stage (This changes depending on the type of integration) */
  next: () => void;
  /** Same as above, but to go back */
  back: () => void;

  /** Partially reset the store */
  abort: (keepOpen?: boolean) => void;

  // Used when the user has confirmed they want to create integration
  createIntegration: boolean;
  existingIntegration: string | undefined;

  // Send warnings to components about various things that can go wrong
  // 'types' = User tried to select a type that is not compatible.
  warning: 'types' | undefined;

  Set: (
    state: Partial<
      Pick<
        IntegrationStore,
        | 'connectionType'
        | 'stage'
        | 'varName'
        | 'rawResult'
        | 'resultPreview'
        | 'resultTypeMapping'
        | 'warning'
        | 'createIntegration'
        | 'existingIntegration'
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

  open: false,
  changeOpen(v) {
    set(() => ({ open: v }));
    if (!v) {
      get().abort();
    }
  },

  connectionType: undefined,
  stage: 'pick-integration',
  varName: generateVarName(true),
  rawResult: undefined,
  resultPreview: undefined,
  resultTypeMapping: [],

  setResultTypeMapping(index, type) {
    const { resultTypeMapping, rawResult, connectionType } = get();

    const clonedTypeMappings = [...resultTypeMapping];
    clonedTypeMappings[index] = type;

    if (rawResult && connectionType) {
      const processedResult = getProcessedResult(rawResult, connectionType);
      importFromJSONAndCoercions(processedResult, clonedTypeMappings).then(
        (res) => {
          if (res == null) {
            // This means our new type mappings cannot be used for the table.
            set({ warning: 'types' });
          } else {
            set({ resultTypeMapping: clonedTypeMappings, resultPreview: res });
          }
        }
      );
    }
  },
  setAllTypeMapping(types) {
    set({ resultTypeMapping: types });
  },

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

  abort: (keepOpen = false) => {
    set({
      stage: 'pick-integration',
      open: keepOpen,
      connectionType: undefined,
      createIntegration: false,
      varName: generateVarName(true),
      resultPreview: undefined,
      existingIntegration: undefined,
      resultTypeMapping: [],
    });

    // Reset dependent stores.
    useCodeConnectionStore.getState().reset();
    useSQLConnectionStore.getState().reset();
    useNotionConnectionStore.getState().Reset();
  },

  createIntegration: false,
  existingIntegration: undefined,

  warning: undefined,
}));

interface ConnectionStore {
  /* Latest result from the connection, so we can fallback on it. */
  latestResult: string;
  timeOfLastRun: string | null;
}

// ------ CODE ------

interface CodeConnectionStore extends ConnectionStore {
  code: string;
  setCode: (newCode: string) => void;
  setLatestResult: (newResult: string) => void;

  reset: () => void;
  onReset: Subject<undefined>;

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

  onReset: new Subject<undefined>(),
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

// ------ SQL ------

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

// ------ NOTION ------

interface NotionConnectionStore extends ConnectionStore {
  NotionDatabaseUrl: string | undefined;
  AvailableDatabases: Array<{ id: string; name: string }>;

  ExternalDataId: string | undefined;
  ExternalDataName: string | undefined;

  DatabaseId: string | undefined;
  DatabaseName: string | undefined;

  lastFetchedDatabasesFor: string | undefined;

  Reset: () => void;
  Set: (NewState: Partial<NotionConnectionStore>) => void;
}

export const useNotionConnectionStore = create<NotionConnectionStore>(
  (set) => ({
    /* Generic Connection Fields */
    latestResult: '',
    timeOfLastRun: null,

    ExternalDataId: undefined,
    ExternalDataName: undefined,

    DatabaseId: undefined,
    DatabaseName: undefined,

    lastFetchedDatabasesFor: undefined,

    /* Notion Specific Fields */
    NotionDatabaseUrl: undefined,
    Reset() {
      set(() => ({
        NotionDatabaseUrl: undefined,
        latestResult: '',
        timeOfLastRun: null,
        ExternalDataId: undefined,
        ExternalDataName: undefined,
        DatabaseId: undefined,
        DatabaseName: undefined,
        mode: undefined,
      }));
    },

    AvailableDatabases: [],

    Set(NewState) {
      set(() => NewState);
    },
  })
);

/**
 * Small helper function to do any pre processing of the raw result.
 * Should deprecate this.
 */
function getProcessedResult(
  rawResult: string,
  type: ImportElementSource
): string {
  switch (type) {
    case 'notion':
      const [res] = importFromNotion(JSON.parse(rawResult));
      return JSON.stringify(res);
    default:
      return rawResult;
  }
}
