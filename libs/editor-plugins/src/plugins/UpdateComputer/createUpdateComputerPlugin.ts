import type { Subject } from 'rxjs';
import type {
  Computer,
  ComputeDeltaRequest,
} from '@decipad/computer-interfaces';
import type { MyPlatePlugin } from '@decipad/editor-types';
import { withUpdateComputerOverride } from './withUpdateComputerOverride';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeDeltaRequest>;
}

export const createUpdateComputerPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  withOverrides: withUpdateComputerOverride(computer),
});
