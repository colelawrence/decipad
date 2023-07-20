import { createContext } from 'react';
import { Subject } from 'rxjs';
import { ActionEvent } from './action';
import { PageEvent } from './page';
import { ChecklistEvent } from './checklist';

export type ClientEvent = PageEvent | ActionEvent | ChecklistEvent;
export type ClientEventContextType = (arg0: ClientEvent) => Promise<void>;

export type ClientActionsType = 'notebook-to-workspace';

const noop = () => Promise.resolve();

export const ClientEventsContext = createContext<ClientEventContextType>(noop);

export const ClientActions = new Subject<ClientActionsType>();

export * from './getAnalytics';
export * from './action';
