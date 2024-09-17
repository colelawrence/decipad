import { Computer } from '@decipad/computer-interfaces';
import { EditorController } from '@decipad/notebook-tabs';
import { FC, ReactNode, memo, useEffect, useMemo } from 'react';
import {
  CREATING_VARIABLE_INITIAL_VALUE,
  useCreatingDataDrawer,
  useEditingDataDrawer,
} from './editor';
import {
  DataDrawerContext,
  DataDrawerCreatingCallback,
  DataDrawerEditorValue,
} from './types';
import {
  CreateVariableWrapper,
  DataDrawerCloseButton,
  DataDrawerDragWrapper,
  DataDrawerFormulaHelperWrapper,
  DataDrawerKeysWrapper,
  DataDrawerWrapper,
  DragPill,
  ErrorParagraph,
  HotKey,
} from './styles';

import { Close } from 'libs/ui/src/icons';
import { p14Medium, SegmentButtons, Toggle } from '@decipad/ui';
import { Plate, PlateContent, focusEditorEdge } from '@udecode/plate-common';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useMyEditorRef } from '@decipad/editor-types';

type DataDrawerResizerProps = {
  height: number;
  onCommitNewHeigfht: (_height: number) => void;
};

const DataDrawerResizer: FC<DataDrawerResizerProps> = ({
  height,
  onCommitNewHeigfht,
}) => {
  return (
    <DragPill
      onMouseDown={(e) => {
        const startY = e.clientY;
        const startHeight = height;

        const onMouseMove = (moveEvent: MouseEvent) => {
          const newHeight = startHeight - (moveEvent.clientY - startY);
          onCommitNewHeigfht(newHeight);
        };

        const onMouseUp = () => {
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      }}
    >
      <div />
    </DragPill>
  );
};

const HotKeys: FC<{ isEditing: boolean }> = ({ isEditing }) => {
  if (isEditing) {
    return (
      <footer>
        Press <HotKey>Esc</HotKey> to dismiss <HotKey>Del</HotKey> to delete
      </footer>
    );
  }

  return (
    <footer>
      Press <HotKey>Enter</HotKey> to save <HotKey>Escape</HotKey> to dismiss
    </footer>
  );
};

export const DataDrawerComponent: FC<{
  computer: Computer;
  controller: EditorController;
  children: ReactNode;
  onClose: () => void;
  title: string;
  isEditing: boolean;
}> = ({ computer, controller, children, onClose, title, isEditing }) => {
  const [height, setHeight] = useNotebookWithIdState(
    (s) => [s.height, s.setHeight] as const
  );

  const [sidebarComponent, pushSidebar, popSidebar] = useNotebookMetaData(
    (s) => [s.sidebarComponent, s.pushSidebar, s.popSidebar]
  );

  return (
    <DataDrawerContext.Provider
      value={useMemo(
        () => ({ computer, controller, isEditing }),
        [computer, controller, isEditing]
      )}
    >
      <DataDrawerDragWrapper height={height}>
        <DataDrawerResizer height={height} onCommitNewHeigfht={setHeight} />
        <DataDrawerKeysWrapper>
          <DataDrawerWrapper>
            <div>
              <p css={p14Medium}>{title}</p>
              <DataDrawerFormulaHelperWrapper>
                Formula Helper
                <Toggle
                  active={
                    sidebarComponent.type === 'formula-helper'
                    // typeof sidebarComponent !== 'string' &&
                    // sidebarComponent.type === 'formula-helper'
                  }
                  onChange={(v) => {
                    if (v) {
                      pushSidebar({
                        type: 'formula-helper',
                        editor: undefined,
                        selection: undefined,
                      });
                    } else {
                      popSidebar();
                    }
                  }}
                  variant="small-toggle"
                />
              </DataDrawerFormulaHelperWrapper>
              <SegmentButtons
                border
                variant="default"
                padding="skinny"
                buttons={[
                  // {
                  //  children: (
                  //    <DataDrawerCloseButton>
                  //      <QuestionMark />
                  //    </DataDrawerCloseButton>
                  //  ),
                  //  onClick: () => {},
                  // },
                  {
                    children: (
                      <DataDrawerCloseButton>
                        <Close />
                      </DataDrawerCloseButton>
                    ),
                    onClick: onClose,
                  },
                ]}
              />
            </div>
            {children}
          </DataDrawerWrapper>
          <HotKeys isEditing={isEditing} />
        </DataDrawerKeysWrapper>
      </DataDrawerDragWrapper>
    </DataDrawerContext.Provider>
  );
};

type EditVariableDataDrawerProps = {
  editingId: string;
};

export const UnmemoEditVariableDataDrawer: FC<EditVariableDataDrawerProps> = ({
  editingId,
}) => {
  const { block, codeEditor, ref } = useEditingDataDrawer(editingId);

  if (block == null) {
    return <div>Loading...</div>;
  }

  return (
    <div ref={ref}>
      <Plate<DataDrawerEditorValue> editor={codeEditor}>
        <PlateContent />
        <FocusEnd />
      </Plate>
    </div>
  );
};

const FocusEnd = () => {
  const editor = useMyEditorRef();
  useEffect(() => {
    setTimeout(() => {
      focusEditorEdge(editor, { edge: 'end' });
    });
  }, [editor]);
  return null;
};

const CreateVariableError: FC<{
  error: ReturnType<typeof useCreatingDataDrawer>['error'];
}> = ({ error }) => {
  switch (error) {
    case 'var-exists':
      return <ErrorParagraph>This variable already exists.</ErrorParagraph>;
    case 'empty-name':
      return <ErrorParagraph>The variable must have a name.</ErrorParagraph>;
    default:
      return null;
  }
};

export const UnmemoCreateVariableDataDrawer: FC = () => {
  const { codeEditor, error, ref, onSubmit } = useCreatingDataDrawer();

  return (
    <DataDrawerCreatingCallback.Provider value={onSubmit}>
      <CreateVariableWrapper ref={ref}>
        <Plate<DataDrawerEditorValue>
          editor={codeEditor}
          initialValue={CREATING_VARIABLE_INITIAL_VALUE}
        >
          <PlateContent />
        </Plate>
        <footer>
          <CreateVariableError error={error} />
        </footer>
      </CreateVariableWrapper>
    </DataDrawerCreatingCallback.Provider>
  );
};

export const EditVariableDataDrawer = memo(UnmemoEditVariableDataDrawer);
export const CreateVariableDataDrawer = memo(UnmemoCreateVariableDataDrawer);
