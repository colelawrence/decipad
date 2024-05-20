import { useContext, createContext } from 'react';
import type { Subject } from 'rxjs';

export * from './useCreateIntegration';
export * from './useEditorElements';
export * from './useIntegrationScreenFactory';
export * from './useDeciVariables';
export * from './useIntegrationOptions';
export * from './useAnalytics';
export * from './useResetState';

export type ContextActions = 'refresh' | 'show-source' | 'delete-block';

export const IntegrationBlockContext = createContext<
  Subject<ContextActions> | undefined
>(undefined);

export const useIntegrationContext = () => useContext(IntegrationBlockContext);
