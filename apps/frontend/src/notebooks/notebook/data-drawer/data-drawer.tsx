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
import { p12Regular, p14Medium, SegmentButtons, Toggle } from '@decipad/ui';
import { Plate, PlateContent, focusEditorEdge } from '@udecode/plate-common';
import { useNotebookWithIdState } from '@decipad/notebook-state';
import { useNotebookMetaData } from '@decipad/react-contexts';
import { useMyEditorRef } from '@decipad/editor-types';
import { useUpsertWorkspaceNumberMutation } from '@decipad/graphql-client';
import { assert } from '@decipad/utils';
import { useToast } from '@decipad/toast';
import { titles } from './title';
import { WorkspaceNumber } from './workspace-number';
import {
  encodeResult,
  recursiveEncoders,
} from '@decipad/remote-computer-codec';
import { GrowableDataView } from 'libs/language-types/src/Value';
import { notebooks } from '@decipad/routing';
import { useNotebookId } from '@decipad/editor-hooks';
import { isFlagEnabled } from '@decipad/feature-flags';
import { PinTack } from 'libs/ui/src/icons/user-icons';
import { blockSelectionStore } from '@udecode/plate-selection';

type DataDrawerResizerProps = {
  parentRef: RefObject<HTMLElement>;
  onCommitNewHeight: (_height: number) => void;
};

const DataDrawerResizer: FC<DataDrawerResizerProps> = ({
  parentRef,
  onCommitNewHeight,
}) => {
  if (parentRef == null) {
    return null;
  }

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

type DataDrawerType =
  | {
      type: 'edit';
      onClose: () => void;
      variableId: string;
      workspaceId: string;
    }
  | {
      type: 'create';
      onClose: () => void;
    }
  | {
      type: 'integration-preview';
    }
  | {
      type: 'workspace-number';
      workspaceId: string;
      workspaceNumberId: string;
    };

const DataDrawerVariableButtons: FC<
  Extract<DataDrawerType, { type: 'edit' | 'create' }>
> = (props) => {
  const [sidebarComponent, pushSidebar, popSidebar] = useNotebookMetaData(
    (s) => [s.sidebarComponent, s.pushSidebar, s.popSidebar]
  );

  const [, upsertWorkspaceNumber] = useUpsertWorkspaceNumberMutation();

  const toast = useToast();
  const [computer, controller] = useNotebookWithIdState(
    (s) => [s.computer, s.controller] as const
  );
  const notebookId = useNotebookId();

  assert(
    computer != null && controller != null,
    'Computer or controller is not defined'
  );

  //
  // WIP:
  //
  // Just save the name of the variable and ignore clashes right now.
  // In the future, we want the user to select a name specific to the
  // workspace.
  //
  // + We want to do some loading state to prevent the user from trying this again.
  // + We want to check if this number already exists?
  //
  const onSaveToWorkspace = async () => {
    if (props.type === 'create' || !computer || !controller) {
      toast.error('Could not save number to workspace.');
      return;
    }

    const result = computer.getBlockIdResult(props.variableId);
    const varName = computer.getSymbolDefinedInBlock(props.variableId);
    assert(result != null && varName != null);

    if (result.type === 'identified-error') {
      toast.warning('Sorry, this result appears to have an error.');
      return;
    }

    const dataView = new GrowableDataView(new ArrayBuffer(1024));
    const offset = await encodeResult(
      dataView,
      0,
      result.result,
      recursiveEncoders
    );

    const base64Result = Buffer.from(dataView.seal(offset)).toString('base64');

    const name = varName;
    const origin = `${
      notebooks({}).notebook({
        notebook: {
          id: notebookId,
          name: '',
        },
      }).$
    }#${props.variableId}`;

    upsertWorkspaceNumber({
      workspaceId: props.workspaceId,
      workspaceNumber: {
        name,
        encoding: base64Result,
        origin,
      },
    })
      .then(() => {
        toast.success(`Number with name ${name} added to workspace`);
      })
      .catch((err) => {
        toast.error(`Error creating workspace number: ${err.message}`);
      });
  };

  const handleOnClose = () => {
    blockSelectionStore.set.selectedIds(new Set());
  };

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
        variant="transparent"
        padding="skinny"
        buttons={[
          ...(isFlagEnabled('WORKSPACE_NUMBERS')
            ? [
                {
                  children: (
                    <div
                      css={{
                        ...p12Regular,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        svg: {
                          width: '16px',
                          height: '16px',
                        },
                      }}
                    >
                      <PinTack /> Save to Workspace
                    </div>
                  ),
                  onClick: onSaveToWorkspace,
                },
              ]
            : []),
          {
            children: (
              <DataDrawerCloseButton onClick={handleOnClose}>
                <Close />
              </DataDrawerCloseButton>
            ),
            onClick: props.onClose,
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
    case 'workspace-number':
    case 'integration-preview':
      return null;
  }
};

const DataDrawerHotKeys: FC<DataDrawerType> = (props) => {
  switch (props.type) {
    case 'create':
      return (
        <footer>
          Press <HotKey>Enter</HotKey> to save <HotKey>Escape</HotKey> to
          dismiss
        </footer>
      );
    case 'edit':
      return (
        <footer>
          Press <HotKey>Esc</HotKey> to dismiss <HotKey>Del</HotKey> to delete
        </footer>
      );
    case 'workspace-number':
      return (
        <footer>
          Press <HotKey>Enter</HotKey> to save
        </footer>
      );
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
    case 'workspace-number':
      return (
        <WorkspaceNumber
          workspaceId={props.workspaceId}
          workspaceNumberId={props.workspaceNumberId}
        />
      );
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

// TODO: hook to get workspace ID?

const useDataDrawerTypeAndTitle = (
  workspaceId: string
): [DataDrawerType, string | undefined] => {
  const [mode, onCloseDataDrawer] = useNotebookWithIdState(
    (s) => [s.dataDrawerMode, s.closeDataDrawer] as const
  );

  const title = titles[mode.type];

  const dataDrawerType = useMemo((): DataDrawerType => {
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
          workspaceId,
        };
      case 'workspace-number':
        return {
          type: 'workspace-number',
          workspaceId,
          workspaceNumberId: mode.workspaceNumberId,
        };
      case 'integration-preview':
        return {
          type: 'integration-preview',
        };
    }
  }, [mode, onCloseDataDrawer, workspaceId]);

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

const UnmemoedDataDrawerInnerContainer: FC<{ workspaceId: string }> = ({
  workspaceId,
}) => {
  const [dataDrawerType, title] = useDataDrawerTypeAndTitle(workspaceId);

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

export const DataDrawerContainer: FC<{ workspaceId: string }> = ({
  workspaceId,
}) => {
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
        <DataDrawerInnerContainer workspaceId={workspaceId} />
      </DataDrawerKeysWrapper>
    </DataDrawerDragWrapper>
  );
};
