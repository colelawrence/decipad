// eslint-disable-next-line no-restricted-imports
import { Computer } from '@decipad/computer';
import { RemoteComputer } from './types';

export const isRemoteComputer = (c: unknown): c is RemoteComputer =>
  c instanceof Computer;
