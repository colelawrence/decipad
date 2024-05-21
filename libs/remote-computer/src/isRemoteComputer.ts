// eslint-disable-next-line no-restricted-imports
import { RemoteComputer } from './remoteComputer';
import type { IRemoteComputer } from './types';

export const isRemoteComputer = (c: unknown): c is IRemoteComputer =>
  c instanceof RemoteComputer;
