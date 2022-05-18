import { Computer, ComputeRequest } from '@decipad/computer';
import { MyEditor, MyPlatePlugin } from '@decipad/editor-types';
import { documentToProgram } from '@decipad/editor-language-elements';
import { Subject } from 'rxjs';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeRequest>;
}

export const createUpdateComputerPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  handlers: {
    onChange: (editor) => () => {
      computer.pushCompute({
        program: documentToProgram((editor as unknown as MyEditor).children),
      });
    },
  },
});
