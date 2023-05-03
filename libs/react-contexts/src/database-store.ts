import { cloneDeep } from 'lodash';
import { create } from 'zustand';
import { ImportElementSource } from '@decipad/editor-types';

type Stage = 'pick-source' | 'connect' | 'create-query' | 'map';
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
};

interface CreateDataStore {
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

  /** What step of the process is the user in? */
  stage: Stage;
  setStage: (v: Stage) => void;

  /** Partially reset the store */
  abort: () => void;
}

export type EasyExternalDataProps = {
  editorId: string;
  url: string;
  provider: ImportElementSource;
};

const initialDbOptions: CreateDataStore['dbOptions'] = {
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

const initialStates: CreateDataStore['states'] = {
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
export const useConnectionStore = create<CreateDataStore>((set, get) => ({
  open: false,
  changeOpen: (v) => set(() => ({ open: v })),

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

  stage: 'pick-source',
  setStage: (v) => set(() => ({ stage: v })),

  abort: () =>
    set(() => ({
      stage: 'pick-source',
      states: cloneDeep(initialStates),
      dbOptions: cloneDeep(initialDbOptions),
      open: false,
      connectionType: undefined,
    })),
}));
