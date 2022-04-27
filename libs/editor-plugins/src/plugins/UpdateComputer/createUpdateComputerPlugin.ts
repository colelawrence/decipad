import { Computer, ComputeRequest } from '@decipad/language';
import { Editor } from '@decipad/editor-types';
import { documentToProgram } from '@decipad/editor-language-elements';
import { Subject } from 'rxjs';
import { PlatePlugin } from '@udecode/plate';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeRequest>;
}

export const createUpdateComputerPlugin = (
  computer: Computer
): PlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  handlers: {
    onChange: (editor) => () => {
      computer.pushCompute({
        program: documentToProgram(editor as unknown as Editor),
      });
    },
  },
});
