import { createContext } from 'react';
import { noop } from '@decipad/utils';
import { ActionEvent } from './action';
import { PageEvent } from './page';

export type ClientEvent = PageEvent | ActionEvent;

export const ClientEventsContext =
  createContext<(clientEvent: ClientEvent) => void>(noop);
