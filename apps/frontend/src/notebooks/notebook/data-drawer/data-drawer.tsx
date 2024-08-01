import { Computer } from '@decipad/computer-interfaces';
import { EditorController } from '@decipad/notebook-tabs';
import { FC, useEffect, useState } from 'react';
import { createDataDrawerEditor } from './editor';
import { DataDrawerContext, DataDrawerEditorValue } from './types';
import { DataDrawerCloseButton, DataDrawerWrapper } from './styles';
import { Close } from 'libs/ui/src/icons';
import { Button, p13Bold, p14Bold } from '@decipad/ui';
import {
  Plate,
  PlateContent,
  getNodeString,
  nanoid,
} from '@udecode/plate-common';
import {
  DataTabChildrenElement,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_CODE_LINE_V2_CODE,
  ELEMENT_DATA_TAB_CHILDREN,
  ELEMENT_STRUCTURED_VARNAME,
} from '@decipad/editor-types';
import { useNotebookState } from '@decipad/notebook-state';
import { useNotebookRouterId } from '../hooks';

type OpenDataDrawerCommonProps = {
  computer: Computer;
  controller: EditorController;

  onClose: () => void;
};

type CreateVariableDataDrawerProps = OpenDataDrawerCommonProps & {
  mode: 'create';
};

type EditVariableDataDrawerProps = OpenDataDrawerCommonProps & {
  mode: 'edit';
  editingId: string;
};

export const EditVariableDataDrawer: FC<EditVariableDataDrawerProps> = ({
  computer,
  controller,
  editingId,
  onClose,
}) => {
  const [codeEditor] = useState(() => createDataDrawerEditor(computer));

  const blockIndex = controller.children[1].children.findIndex(
    (c) => c.id === editingId
  );

  const block =
    blockIndex === -1 ? undefined : controller.children[1].children[blockIndex];

  useEffect(() => {
    const { apply } = codeEditor;

    codeEditor.apply = function proxyToController(op) {
      apply(op);

      if (op.type === 'set_selection') {
        return;
      }

      controller.apply({
        ...op,
        path: [1, blockIndex, ...op.path.slice(1)],
      });
    };

    return () => {
      codeEditor.apply = apply;
    };
  }, [blockIndex, codeEditor, controller]);

  if (block == null) {
    return <div>Loading...</div>;
  }

  const [varName, code] = block.children;

  return (
    <DataDrawerContext.Provider value={{ computer }}>
      <DataDrawerWrapper>
        <div>
          <p css={p14Bold}>Edit Variable</p>
          <DataDrawerCloseButton onClick={onClose}>
            <Close />
          </DataDrawerCloseButton>
        </div>
        <Plate<DataDrawerEditorValue>
          editor={codeEditor}
          initialValue={[
            {
              type: ELEMENT_CODE_LINE_V2,
              id: nanoid(),
              children: [varName, code],
            },
          ]}
        >
          <PlateContent />
        </Plate>
      </DataDrawerWrapper>
    </DataDrawerContext.Provider>
  );
};

export const CreateVariableDataDrawer: FC<CreateVariableDataDrawerProps> = ({
  computer,
  controller,
  onClose,
}) => {
  const [codeEditor] = useState(() => createDataDrawerEditor(computer));
  const [error, setError] = useState<'var-exists' | undefined>(undefined);

  const notebookId = useNotebookRouterId();

  const setEditingVariable = useNotebookState(
    notebookId,
    (state) => state.setEditingVariable
  );

  const onSubmit = () => {
    const exists = computer.variableExists(
      getNodeString(codeEditor.children[0].children[0]).trim()
    );
    if (exists) {
      setError('var-exists');
      return;
    }

    const newVariableId = nanoid();

    controller.apply({
      type: 'insert_node',
      path: [1, controller.children[1].children.length],
      node: {
        id: newVariableId,
        type: ELEMENT_DATA_TAB_CHILDREN,
        children: codeEditor.children[0].children,
      } satisfies DataTabChildrenElement,
    });

    setEditingVariable(newVariableId);
  };

  return (
    <DataDrawerContext.Provider value={{ computer }}>
      <DataDrawerWrapper>
        <div>
          <p css={p14Bold}>Add Variable</p>
          <DataDrawerCloseButton onClick={onClose}>
            <Close />
          </DataDrawerCloseButton>
        </div>
        <Plate<DataDrawerEditorValue>
          editor={codeEditor}
          onSelectionChange={() => {
            if (error == null) {
              return;
            }

            setError(undefined);
          }}
          initialValue={[
            {
              type: ELEMENT_CODE_LINE_V2,
              id: nanoid(),
              children: [
                {
                  type: ELEMENT_STRUCTURED_VARNAME,
                  id: nanoid(),
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
                {
                  type: ELEMENT_CODE_LINE_V2_CODE,
                  id: nanoid(),
                  children: [
                    {
                      text: '',
                    },
                  ],
                },
              ],
            },
          ]}
        >
          <PlateContent />
        </Plate>
        <footer>
          {error && <p css={p13Bold}>This variable already exists.</p>}
          <div>
            <Button type="primary" onClick={onSubmit}>
              Create Variable
            </Button>
          </div>
        </footer>
      </DataDrawerWrapper>
    </DataDrawerContext.Provider>
  );
};
