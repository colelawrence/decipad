import { createContext } from 'react';
import { ActionEvent } from './action';
import { PageEvent } from './page';
import { ChecklistEvent } from './checklist';

export type ClientEvent = PageEvent | ActionEvent | ChecklistEvent;
export type ClientEventContextType = (arg0: ClientEvent) => Promise<void>;

const noop = () => Promise.resolve();

export const ClientEventsContext = createContext<ClientEventContextType>(noop);

export * from './getAnalytics';
export * from './action';
