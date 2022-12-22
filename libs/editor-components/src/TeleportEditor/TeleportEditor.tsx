import { MyEditor } from '@decipad/editor-types';
import { focusAndSetSelection } from '@decipad/editor-utils';
import {
  EditorTeleportContext,
  ShadowCalcPortal,
  ShadowCalcReference,
} from '@decipad/react-contexts';
import { findNodePath } from '@udecode/plate';
import { ClientEvent, ClientEventsContext } from '@decipad/client-events';
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from 'react';
import { Subject } from 'rxjs';
import { ensureSelectionHack } from './ensureSelectionHack';
import { useFocusControl } from './useFocusControl';

type TeleportEditorProps = PropsWithChildren<{ editor: MyEditor }>;

export const openEditor$ = new Subject<ShadowCalcReference>();
export const editorAnalytics$ = new Subject<ClientEvent>();

export const TeleportEditor: React.FC<TeleportEditorProps> = ({
  children,
  editor,
}) => {
  const [portal, setPortal] = useState<ShadowCalcPortal>();
  const [editing, setEditing] = useState<ShadowCalcReference>();
  const clientEvent = useContext(ClientEventsContext);

  const focusNumber = useCallback(() => {
    const node = editing?.numberNode;
    const path = node ? findNodePath(editor, node) : null;

    if (path) {
      focusAndSetSelection(editor, path);
    }
  }, [editor, editing?.numberNode]);

  const focusCodeLine = useCallback(() => {
    const node = editing?.codeLineNode;
    const path = node ? findNodePath(editor, node) : null;

    if (!path) return;

    ensureSelectionHack(editor, true);
    focusAndSetSelection(editor, path);
  }, [editor, editing?.codeLineNode]);

  const closeEditor = useCallback(
    (codeLineId?: string, onClose?: () => void) =>
      setEditing((old) => {
        const anyCodeLine = codeLineId == null;
        const matchingCodeLine = old?.codeLineId === codeLineId;

        const shouldClose = anyCodeLine || matchingCodeLine;

        if (shouldClose) {
          onClose?.();
          return undefined;
        }

        clientEvent({
          type: 'action',
          action: 'code line teleported back',
        });

        return old;
      }),
    [setEditing, clientEvent]
  );

  const onBlur = useCallback(() => closeEditor(), [closeEditor]);
  const { useWatchTeleported } = useFocusControl(editing, closeEditor);

  const openEditor = useCallback(
    (ref: ShadowCalcReference) => {
      setEditing(ref);

      clientEvent({
        type: 'action',
        action: 'code line teleported',
      });
    },
    [setEditing, clientEvent]
  );

  useEffect(() => {
    const sub = openEditor$.subscribe((ref) => openEditor(ref));

    return () => sub.unsubscribe();
  }, [openEditor]);

  useEffect(() => {
    const sub = editorAnalytics$.subscribe((event) => clientEvent(event));

    return () => sub.unsubscribe();
  }, [clientEvent]);

  const value = useMemo(
    () => ({
      portal,
      editing,
      setPortal,
      focusNumber,
      focusCodeLine,
      closeEditor,
      openEditor,
      useWatchTeleported,
    }),
    [
      portal,
      editing,
      setPortal,
      focusNumber,
      focusCodeLine,
      closeEditor,
      openEditor,
      useWatchTeleported,
    ]
  );

  return (
    <EditorTeleportContext.Provider value={value}>
      <span onBlur={onBlur}>{children}</span>
    </EditorTeleportContext.Provider>
  );
};
