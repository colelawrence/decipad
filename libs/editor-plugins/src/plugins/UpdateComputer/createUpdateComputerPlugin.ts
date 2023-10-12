import { Subject } from 'rxjs';
import { RemoteComputer, ComputeRequest } from '@decipad/remote-computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { withUpdateComputerOverride } from './withUpdateComputerOverride';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeRequest>;
}

export const createUpdateComputerPlugin = (
  computer: RemoteComputer
): MyPlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  withOverrides: withUpdateComputerOverride(computer),
});
