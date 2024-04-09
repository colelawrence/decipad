import { createContext } from 'react';
import type { ActionEvent } from './action';
import type { PageEvent } from './page';
import type { ChecklistEvent } from './checklist';
import type { EventArgs } from 'react-ga';

export type ClientEvent = PageEvent | ActionEvent | ChecklistEvent;

export type SegmentEventArgs = {
  segmentEvent: ClientEvent;
};

export type GaEventArgs = {
  gaEvent: EventArgs;
};

export type HandleClientEventArgs =
  | SegmentEventArgs
  | GaEventArgs
  | (SegmentEventArgs & GaEventArgs);

export type ClientEventContextType = (
  arg0: HandleClientEventArgs
) => Promise<void>;

const noop = () => Promise.resolve();

export const ClientEventsContext = createContext<ClientEventContextType>(noop);

export * from './getAnalytics';
export * from './action';
