import { Subject } from 'rxjs';
import { Computer, ComputeRequest } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { withUpdateComputerOverride } from './withUpdateComputerOverride';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeRequest>;
}

export const createUpdateComputerPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  withOverrides: withUpdateComputerOverride(computer),
});
