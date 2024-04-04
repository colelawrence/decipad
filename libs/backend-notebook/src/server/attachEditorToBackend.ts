import { Doc as YDoc } from 'yjs';
import type {
  SyncElement,
  TYjsEditor as GTYjsEditor,
} from '@decipad/slate-yjs';
import { withYjs } from '@decipad/slate-yjs';
import { DynamodbPersistence } from '@decipad/y-dynamodb';
import { LambdaWebsocketProvider } from '@decipad/y-lambdawebsocket';
import type { MinimalRootEditor } from '@decipad/editor-types';
import { timeout } from '@decipad/utils';

type Detach = () => Promise<void>;

type TYjsEditor = GTYjsEditor<MinimalRootEditor>;

export const attachEditorToBackend = async (
  editor: MinimalRootEditor
): Promise<[TYjsEditor, Detach]> => {
  const doc = new YDoc();
  const shared = doc.getArray<SyncElement>();
  const yjsEditor = withYjs(editor, shared);
  const resource = `/pads/${editor.id}`;
  const persistence = new DynamodbPersistence(resource, doc, undefined, false, {
    saveOnUpdate: true,
  });
  const comms = new LambdaWebsocketProvider(resource, undefined, doc, {
    protocolVersion: 2,
  });
  await timeout(1000); // TODO: fixed timeout
  await persistence.flush();
  await comms.flush();
  const detach: Detach = async () => {
    await timeout(1000);
    await comms.flush();
    await persistence.flush();

    persistence.destroy();
    comms.destroy();
    doc.destroy();
  };

  return [yjsEditor, detach];
};
