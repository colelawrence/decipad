import { Computer } from '@decipad/computer';
import { ExternalProvider } from '@decipad/graphql-client';
import { tryImport } from '@decipad/import';
import { DbOptions } from '@decipad/ui';
import { cloneDeep } from 'lodash';
import { create } from 'zustand';
import { EasyExternalDataProps, insertExternalData } from '../utils';

type Stage = 'pick-source' | 'connect' | 'create-query' | 'map';
type States = {
  connectionState: { type: 'success' | 'error'; message: string } | undefined;
  queryState: { type: 'success' | 'error'; message: string } | undefined;
};

interface CreateDataStore {
  open: boolean;
  changeOpen: (v: boolean) => void;

  connectionType?: ExternalProvider;
  setConnectionType: (v: ExternalProvider) => void;

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
    })),
}));

/**
 * Attempts to connect to backend by inserting external data,
 * and then importing it. Returns the ID of the external data,
 * or undefined if it was unsuccessful.
 */
export async function attemptConnection(
  props: EasyExternalDataProps,
  computer: Computer
): Promise<string | undefined> {
  const newExternalData = await insertExternalData(props);
  if (newExternalData.dataUrl == null) return undefined;

  // We simply need to check if we can import or not.
  try {
    await tryImport({
      computer,
      url: new URL(newExternalData.dataUrl ?? ''),
    });
    return newExternalData.dataUrl;
  } catch (error) {
    // Do nothing
  }
  return undefined;
}

/**
 * Queries the backend for the external data, to check if query is valid.
 * Returns an error State @see States.
 */
export async function fetchQuery(
  url: string,
  query: string
): Promise<States['queryState']> {
  const queryRes = await fetch(url, {
    body: query,
    method: 'POST',
  });

  if (!queryRes.ok) {
    const err = await errorFromFetchResult(queryRes);
    return {
      type: 'error',
      message: err ?? 'There was an error with your query',
    };
  }

  return {
    type: 'success',
    message: 'Query executed successfully',
  };
}

// Helper function to extract error message from result.
export async function errorFromFetchResult(
  resp: Response
): Promise<string | undefined> {
  const respText = await resp.text();
  try {
    const respJson = JSON.parse(respText);
    if ('message' in respJson) {
      return respJson.message;
    }
  } catch (err) {
    // Do nothing
  }
  return undefined;
}
