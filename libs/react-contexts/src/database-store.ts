/* eslint-disable no-param-reassign */
import { create } from 'zustand';
import type { Result } from '@decipad/remote-computer';
import { codePlaceholder } from '@decipad/frontend-config';
import type {
  ImportElementSource,
  SimpleTableCellType,
} from '@decipad/editor-types';
import { type Prettify, generateVarName } from '@decipad/utils';
import { importFromJSONAndCoercions, importFromNotion } from '@decipad/import';
import { Subject } from 'rxjs';
import omit from 'lodash.omit';
import pick from 'lodash.pick';

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
  timeOfLastRun: string | null;

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

  Stringify: () => string;

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

  Stringify() {
    const selectedState = pick(get(), 'connectionType', 'open');
    return Buffer.from(JSON.stringify(selectedState)).toString('base64');
  },

  open: false,
  changeOpen(v) {
    set(() => ({ open: v }));
    if (!v) {
      get().abort();
    }
  },

  timeOfLastRun: null,
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

// ------ CODE ------

interface CodeConnectionStore {
  code: string;
  setCode: (newCode: string) => void;

  reset: () => void;
  onReset: Subject<undefined>;

  showAi: boolean;
  toggleShowAi: (b?: boolean) => void;
}

export const useCodeConnectionStore = create<CodeConnectionStore>((set) => ({
  code: codePlaceholder(),
  setCode: (v) => set(() => ({ code: v })),

  onReset: new Subject<undefined>(),
  reset: () =>
    set(() => ({
      code: codePlaceholder(),
    })),

  showAi: false,
  toggleShowAi: (b) =>
    set(({ showAi }) => ({ showAi: b === undefined ? !showAi : b })),
}));

// ------ SQL ------

interface SQLConnectionStore {
  ExternalDataId: string | undefined;
  ExternalDataName: string | undefined;
  Query: string;

  reset: () => void;
  Set: (NewState: Partial<SQLConnectionStore>) => void;
}

export const useSQLConnectionStore = create<SQLConnectionStore>((set) => ({
  /* SQL Specific Fields */
  ExternalDataId: undefined,
  ExternalDataName: undefined,
  Query: '',

  reset() {
    set(() => ({
      Query: '',
      ExternalDataId: undefined,
      ExternalDataName: undefined,
    }));
  },

  Set(NewState) {
    set(() => NewState);
  },
}));

// ------ NOTION ------

interface NotionConnectionStore {
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
    ExternalDataId: undefined,
    ExternalDataName: undefined,

    DatabaseId: undefined,
    DatabaseName: undefined,

    lastFetchedDatabasesFor: undefined,

    NotionDatabaseUrl: undefined,
    Reset() {
      set(() => ({
        NotionDatabaseUrl: undefined,
        ExternalDataId: undefined,
        ExternalDataName: undefined,
        DatabaseId: undefined,
        DatabaseName: undefined,
      }));
    },

    AvailableDatabases: [],

    Set(NewState) {
      set(() => NewState);
    },
  })
);

interface GSheetConnectionStore {
  ExternalDataId: string | undefined;
  ExternalDataName: string | undefined;

  SpreadsheetURL: string | undefined;
  OriginalUrl: string | undefined;

  SelectedSheetName: string | undefined;
  SpreeadsheetSubsheets: Array<{ id: number; name: string }>;
  SelectedSubsheet: { id: number; name: string } | undefined;

  Stringify: () => string;

  Set: (
    NewState: Prettify<Omit<Partial<GSheetConnectionStore>, 'Set'>>
  ) => void;
}

export const useGSheetConnectionStore = create<GSheetConnectionStore>(
  (set, get) => ({
    ExternalDataId: undefined,
    ExternalDataName: undefined,
    ExternalDataLinkId: undefined,
    ExternalDataLink: undefined,

    SelectedSheetName: undefined,
    OriginalUrl: undefined,
    SpreadsheetURL: undefined,

    SpreeadsheetSubsheets: [],
    SelectedSubsheet: undefined,

    Stringify() {
      const state = omit(get(), 'Set', 'Stringify');
      return Buffer.from(JSON.stringify(state)).toString('base64');
    },

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
