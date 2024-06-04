// eslint-disable-next-line no-restricted-imports
import type { Computer } from '@decipad/computer-interfaces';
import { RemoteComputer } from './remoteComputer';

export const isRemoteComputer = (c: unknown): c is Computer =>
  c instanceof RemoteComputer;
