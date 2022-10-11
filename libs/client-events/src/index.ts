import { createContext } from 'react';
import { noop } from '@decipad/utils';
import { ActionEvent } from './action';
import { PageEvent } from './page';
import { ChecklistEvent } from './checklist';

export type ClientEvent = PageEvent | ActionEvent | ChecklistEvent;
export type ClientEventContextType = (arg0: ClientEvent) => void;

export const ClientEventsContext = createContext<ClientEventContextType>(noop);

export * from './useAnalytics';
export * from './action';
