import { Subject } from 'rxjs';
import { Computer, ComputeRequest } from '@decipad/computer';
import { MyPlatePlugin } from '@decipad/editor-types';
import { editorToProgram } from '@decipad/editor-language-elements';
import { debounce } from 'lodash';

export interface UpdateComputerPluginProps {
  computeRequests: Subject<ComputeRequest>;
}

const DEBOUNCE_UPDATE_COMPUTER_MS = 500;

export const createUpdateComputerPlugin = (
  computer: Computer
): MyPlatePlugin => ({
  key: 'UPDATE_COMPUTER_PLUGIN',
  withOverrides: (editor) => {
    const { onChange } = editor;
    const compute = debounce(async () => {
      computer.pushCompute(await editorToProgram(editor, computer));
    }, DEBOUNCE_UPDATE_COMPUTER_MS);

    // eslint-disable-next-line no-param-reassign
    editor.onChange = () => {
      compute();
      onChange();
    };

    compute();

    return editor;
  },
});
