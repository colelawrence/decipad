import { ImportElementSource } from '@decipad/editor-types';
import { getDefined } from '@decipad/utils';
import providers from './providers';

export const isImportUrl = (text: string): undefined | ImportElementSource => {
  let url: URL | undefined;
  try {
    url = new URL(text);
  } catch (err) {
    // not a URL
    return undefined;
  }
  return providers.find(({ matchUrl }) => {
    try {
      return matchUrl(getDefined(url));
    } catch (err) {
      return false;
    }
  })?.name as undefined | ImportElementSource;
};
