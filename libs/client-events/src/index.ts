import { createContext } from 'react';
import type { ActionEvent } from './action';
import type { PageEvent } from './page';
import type { ChecklistEvent } from './checklist';

export type ClientEvent = PageEvent | ActionEvent | ChecklistEvent;
export type ClientEventContextType = (arg0: ClientEvent) => Promise<void>;

const noop = () => Promise.resolve();

export const ClientEventsContext = createContext<ClientEventContextType>(noop);

export * from './getAnalytics';
export * from './action';
