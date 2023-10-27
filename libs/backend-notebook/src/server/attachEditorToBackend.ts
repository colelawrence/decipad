import { Doc as YDoc } from 'yjs';
import type { EditorController } from '@decipad/notebook-tabs';
import { SyncElement, YjsEditor, withYjs } from '@decipad/slate-yjs';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { LambdaWebsocketProvider } from '@decipad/y-lambdawebsocket';

type Detach = () => Promise<void>;

export const attachEditorToBackend = async (
  editor: EditorController
): Promise<[YjsEditor, Detach]> => {
  const doc = new YDoc();
  const shared = doc.getArray<SyncElement>();
  const yjsEditor = withYjs(editor, shared);
  const resource = `/pads/${editor.NotebookId}`;
  const persistence = new DynamodbPersistence(resource, doc, undefined, false, {
    saveOnUpdate: true,
  });
  const comms = new LambdaWebsocketProvider(resource, undefined, doc, {
    protocolVersion: 2,
  });
  await persistence.flush();
  const detach: Detach = async () => {
    await comms.flush();
    await persistence.flush();

    persistence.destroy();
    comms.destroy();
    doc.destroy();
  };

  return [yjsEditor, detach];
};
