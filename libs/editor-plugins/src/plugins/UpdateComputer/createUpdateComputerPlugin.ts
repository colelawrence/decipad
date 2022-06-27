import { Computer, ComputeRequest } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { editorToProgram } from '@decipad/editor-language-elements';
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
      computer.pushCompute(editorToProgram(editor));
    },
  },
});
