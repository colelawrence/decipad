/* eslint-disable no-param-reassign */
import { Result } from '@decipad/computer';
import { codePlaceholder } from '@decipad/config';
import {
  ImportElementSource,
  SimpleTableCellType,
} from '@decipad/editor-types';
import cloneDeep from 'lodash.clonedeep';
import { create } from 'zustand';
import { mapResultType } from './utils';

export type Stage =
  | 'pick-integration'
  | 'connect' // Actually connect to your source.
  | 'create-query' // Mostly for databases, but you might need to specify a query seperate from connection.
  | 'map' // Map your data into the deci notebook.
  | 'settings';

type States = {
  connectionState: { type: 'success' | 'error'; message: string } | undefined;
  queryState: { type: 'success' | 'error'; message: string } | undefined;
};

export type DbOptions = {
  connectionString: string;

  // Credential connection
  host: string;
  username: string;
  password: string;
  database: string;
  port: string;

  existingConn: {
    name: string;
    id: string;
  };

  dbConnType?: 'url' | 'credentials' | 'existing-conn';

  query: string;
  showQueryResults?: boolean;
};

const IntegrationSteps: Record<ImportElementSource, Array<Stage>> = {
  codeconnection: ['connect', 'map'],
  decipad: [],
  gsheets: [],
  csv: [],
  json: [],
  arrow: [],
  postgresql: [],
  mysql: [],
  oracledb: [],
  cockroachdb: [],
  redshift: [],
  mssql: [],
  mariadb: [],
};

export interface IntegrationStore {
  open: boolean;
  changeOpen: (v: boolean) => void;

  connectionType?: ImportElementSource;
  setConnectionType: (v: ImportElementSource | undefined) => void;

  dbOptions: DbOptions;
  setDbOptions: (v: Partial<DbOptions>) => void;

  /** Deals with error states and success states, and messages for both */
  states: States;
  setStates: (v: Partial<States>) => void;

  /** Reference to the backend proxy url, through which we query external data */
  externalDataSource?: string;
  setExternalDataSource: (v: string | undefined) => void;

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

const initialDbOptions: IntegrationStore['dbOptions'] = {
  query: '',
  connectionString: '',
  host: '',
  username: '',
  password: '',
  database: '',
  port: '',
  existingConn: {
    name: '',
    id: '',
  },
};

const initialStates: IntegrationStore['states'] = {
  connectionState: undefined,
  queryState: undefined,
};

/**
 * Returns the zustand store for the data integrations creation.
 *
 * The store handles connection options, errors and current stages of the modal.
 *
 * @dbOptions -> Handles everything database related, except errors.
 * @states -> Is the connection ok? is the query ok? each one is undefined
 * if it hasn't been attempted yet.
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

  dbOptions: initialDbOptions,
  setDbOptions: (v) =>
    set(() => ({
      dbOptions: {
        ...get().dbOptions,
        ...v,
      },
    })),

  states: initialStates,
  setStates: (v) =>
    set(() => ({
      states: {
        ...get().states,
        ...v,
      },
    })),

  setExternalDataSource: (v) => set(() => ({ externalDataSource: v })),

  stage: 'pick-integration',
  setStage: (v) => set(() => ({ stage: v })),

  varName: 'Name',
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
    const { connectionType, stage, existingIntegration } = get();
    // If it is the last element, it must be the last, so we do something different.
    if (
      connectionType &&
      IntegrationSteps[connectionType].at(-1) !== stage &&
      !existingIntegration
    ) {
      set((state) => ({
        stage: state.connectionType
          ? IntegrationSteps[state.connectionType][
              IntegrationSteps[state.connectionType].indexOf(state.stage) + 1
            ]
          : state.stage,
      }));
    } else {
      // User clicked continue on last page, create integration.
      set(() => ({ createIntegration: true }));
    }
  },

  back() {
    const { abort, connectionType, stage } = get();
    if (!connectionType) return;
    // If we are at one, if means going back will lead us to the "New integrations page".
    if (IntegrationSteps[connectionType].indexOf(stage) === 1) {
      abort(true);
      return;
    }

    set((state) => ({
      stage: state.connectionType
        ? IntegrationSteps[state.connectionType][
            IntegrationSteps[state.connectionType].indexOf(state.stage) - 1
          ]
        : state.stage,
    }));
  },

  abort: (keepOpen = false) => {
    set(() => ({
      stage: 'pick-integration',
      states: cloneDeep(initialStates),
      dbOptions: cloneDeep(initialDbOptions),
      open: keepOpen,
      connectionType: undefined,
      createIntegration: false,
      varName: 'Name',
      // resultPreview: undefined,
      existingIntegration: undefined,
      resultTypeMapping: [],
    }));

    // Reset dependent stores.
    useCodeConnectionStore.getState().reset();
  },

  createIntegration: false,
  existingIntegration: undefined,
  setExistingIntegration: (v) => set(() => ({ existingIntegration: v })),
}));

interface CodeConnectionStore {
  code: string;
  setCode: (newCode: string) => void;
  // Latest message from worker.
  latestResult: string;
  setLatestResult: (newResult: string) => void;

  timeOfLastRun: string | null;

  reset: () => void;
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
}));
