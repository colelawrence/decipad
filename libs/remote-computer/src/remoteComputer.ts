// eslint-disable-next-line no-restricted-imports
import { Computer } from '@decipad/computer';
import { RemoteComputer } from './types';

export const getRemoteComputer = (
  ...args: ConstructorParameters<typeof Computer>
): RemoteComputer => new Computer(...args);
