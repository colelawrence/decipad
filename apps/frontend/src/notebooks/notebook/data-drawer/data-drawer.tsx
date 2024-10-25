import {
  FC,
  memo,
  ReactNode,
  RefObject,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import {
  CREATING_VARIABLE_INITIAL_VALUE,
  useCreatingDataDrawer,
  useEditingDataDrawer,
} from './editor';
import { DataDrawerCreatingCallback, DataDrawerEditorValue } from './types';
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
  DataDrawerContentWrapper,
  EditVariableContainer,
} from './styles';
import { Close } from 'libs/ui/src/icons';
import { p14Medium, SegmentButtons, Toggle } from '@decipad/ui';
import { Plate, PlateContent, focusEditorEdge } from '@udecode/plate-common';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useMyEditorRef } from '@decipad/editor-types';
import { assert } from '@decipad/utils';
import { titles } from './title';

type DataDrawerResizerProps = {
  parentRef: RefObject<HTMLElement>;
  onCommitNewHeight: (_height: number) => void;
};

const DataDrawerResizer: FC<DataDrawerResizerProps> = ({
  parentRef,
  onCommitNewHeight,
}) => {
  return (
    <DragPill
      onMouseDown={(e) => {
        if (!parentRef.current) return;

        const startY = e.clientY;
        const startHeight = parentRef.current.clientHeight;

        onCommitNewHeight(parentRef.current.clientHeight);

        const onMouseMove = (moveEvent: MouseEvent) => {
          const newHeight = startHeight - (moveEvent.clientY - startY);
          onCommitNewHeight(newHeight);
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

type DataDrawerType =
  | {
      type: 'edit';
      onClose: () => void;
      variableId: string;
    }
  | {
      type: 'create';
      onClose: () => void;
    }
  | {
      type: 'integration-preview';
    };

const DataDrawerVariableButtons: FC<
  Extract<DataDrawerType, { type: 'edit' | 'create' }>
> = ({ onClose }) => {
  const [sidebarComponent, pushSidebar, popSidebar] = useNotebookMetaData(
    (s) => [s.sidebarComponent, s.pushSidebar, s.popSidebar]
  );

  return (
    <>
      <DataDrawerFormulaHelperWrapper>
        Formula Helper
        <Toggle
          active={sidebarComponent.type === 'formula-helper'}
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
    </>
  );
};

const DataDrawerButtons: FC<DataDrawerType> = (props) => {
  switch (props.type) {
    case 'create':
    case 'edit':
      return <DataDrawerVariableButtons {...props} />;
    case 'integration-preview':
      return null;
  }
};

const DataDrawerHotKeys: FC<DataDrawerType> = (props) => {
  switch (props.type) {
    case 'create':
      return <HotKeys isEditing={false} />;
    case 'edit':
      return <HotKeys isEditing={true} />;
    case 'integration-preview':
      return null;
  }
};

const DataDrawerContent: FC<DataDrawerType> = (props) => {
  switch (props.type) {
    case 'create':
      return <CreateVariableDataDrawer />;
    case 'edit':
      return <EditVariableDataDrawer editingId={props.variableId} />;
    case 'integration-preview':
      // We portal in.
      return null;
  }
};

type EditVariableDataDrawerProps = {
  editingId: string;
};

const EditVariableDataDrawer: FC<EditVariableDataDrawerProps> = ({
  editingId,
}) => {
  const { block, codeEditor, ref } = useEditingDataDrawer(editingId);

  if (block == null) {
    return <div>Loading...</div>;
  }

  return (
    <EditVariableContainer ref={ref}>
      <Plate<DataDrawerEditorValue> editor={codeEditor}>
        <PlateContent />
        <FocusEnd />
      </Plate>
    </EditVariableContainer>
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

const CreateVariableDataDrawer: FC = () => {
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

const useDataDrawerTypeAndTitle = (): [DataDrawerType, string | undefined] => {
  const [mode, onCloseDataDrawer] = useNotebookWithIdState(
    (s) => [s.dataDrawerMode, s.closeDataDrawer] as const
  );

  const title = titles[mode.type];

  const dataDrawerType = useMemo<DataDrawerType>(() => {
    assert(mode.type !== 'closed', 'unreachable');

    switch (mode.type) {
      case 'create':
        return {
          type: 'create',
          onClose: onCloseDataDrawer,
        };
      case 'edit':
        return {
          type: 'edit',
          onClose: onCloseDataDrawer,
          variableId: mode.variableId,
        };
      case 'integration-preview':
        return {
          type: 'integration-preview',
        };
    }
  }, [mode, onCloseDataDrawer]);

  return [dataDrawerType, title];
};

const TitleAndButtons: FC<{
  title: string | undefined;
  children: ReactNode;
}> = ({ title, children }) => {
  if (title == null) {
    return null;
  }

  return (
    <div>
      <p css={p14Medium}>{title}</p>
      {children}
    </div>
  );
};

const UnmemoedDataDrawerInnerContainer: FC = () => {
  const [dataDrawerType, title] = useDataDrawerTypeAndTitle();

  return (
    <>
      <DataDrawerWrapper>
        <TitleAndButtons title={title}>
          <DataDrawerButtons {...dataDrawerType} />
        </TitleAndButtons>
        <DataDrawerContentWrapper id="data-drawer-content">
          <DataDrawerContent {...dataDrawerType} />
        </DataDrawerContentWrapper>
      </DataDrawerWrapper>
      <DataDrawerHotKeys {...dataDrawerType} />
    </>
  );
};

/**
 * We wrap this in a memo because the height can change a lot.
 *
 * And by default React re-renders children even if no props changed.
 * Memo alters this behavior, only re-rendering if the props change.
 *
 * And since this component has no props. It won't re-render.
 */
const DataDrawerInnerContainer = memo(UnmemoedDataDrawerInnerContainer);

export const DataDrawerContainer: FC = () => {
  const [height, setHeight, setIsDataDrawerOpen] = useNotebookWithIdState(
    (s) => [s.height, s.setHeight, s.setIsDataDrawerOpen] as const
  );

  const dataDrawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDataDrawerOpen(true);

    return () => {
      setIsDataDrawerOpen(false);
    };
  }, [setIsDataDrawerOpen]);

  return (
    <DataDrawerDragWrapper ref={dataDrawerRef} height={height}>
      <DataDrawerResizer
        parentRef={dataDrawerRef}
        onCommitNewHeight={setHeight}
      />
      <DataDrawerKeysWrapper maxHeight={height}>
        <DataDrawerInnerContainer />
      </DataDrawerKeysWrapper>
    </DataDrawerDragWrapper>
  );
};
