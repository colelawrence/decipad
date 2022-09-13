import { Subject } from 'rxjs';
import { Computer, ComputeRequest } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { editorToProgram } from '@decipad/editor-language-elements';
import { getCursorPos } from './getCursorPos';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeRequest>;
}

export const createUpdateComputerPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  withOverrides: (editor) => {
    const { onChange } = editor;
    const compute = async () => {
      computer.setCursorBlockId(getCursorPos(editor));
      computer.pushCompute(await editorToProgram(editor, computer));
    };

    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      compute();
      onChange();
    };

    compute();

    return editor;
  },
});
