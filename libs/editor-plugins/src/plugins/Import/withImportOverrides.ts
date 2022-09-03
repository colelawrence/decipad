import { WithOverride } from '@udecode/plate';
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
          interactions?.next({
            type: 'pasted-link',
            url: text,
            source,
          });
        }
      })();
      insertData(data);
    };

    return editor;
  };
