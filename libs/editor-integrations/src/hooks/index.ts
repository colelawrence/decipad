import { useContext, createContext } from 'react';
import { Subject } from 'rxjs';

export * from './useCreateIntegration';
export * from './useEditorElements';
export * from './useWorker';
export * from './useIntegrationScreenFactory';
export * from './useNotionQuery';
export * from './useDeciVariables';
export * from './useIntegrationOptions';

export type ContextActions = 'refresh' | 'show-source' | 'delete-block';

export const IntegrationBlockContext = createContext<
  Subject<ContextActions> | undefined
>(undefined);

export const useIntegrationContext = () => useContext(IntegrationBlockContext);
