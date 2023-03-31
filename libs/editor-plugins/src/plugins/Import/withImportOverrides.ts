import { WithOverride, getNode } from '@udecode/plate';
import { isImportUrl } from '@decipad/import';
import type { UserInteraction } from '@decipad/react-contexts';
import { Subject } from 'rxjs';

export const withImportOverrides =
  (interactions?: Subject<UserInteraction>): WithOverride =>
  (editor) => {
    const { insertData } = editor;

    // eslint-disable-next-line no-param-reassign
    editor.insertData = (data) => {
      (async () => {
        const text = data.getData('text/plain');
        const [isImportable, source] = await isImportUrl(text);
        if (isImportable) {
          const currentPath = editor.selection?.anchor.path;
          if (currentPath) {
            const blockId = getNode(editor, [currentPath[0]])?.id;
            if (blockId) {
              interactions?.next({
                type: 'pasted-link',
                url: text,
                source,
                blockId,
              });
            }
          }
        }
      })();
      insertData(data);
    };

    return editor;
  };
