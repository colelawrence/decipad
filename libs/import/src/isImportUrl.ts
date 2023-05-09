import { ImportElementSource } from '@decipad/editor-types';
import { PromiseOrType, getDefined } from '@decipad/utils';
import providers from './providers';
import { isRandomImportUrl } from './isRandomImportUrl';

type IsImportUrlResult = [boolean, undefined | ImportElementSource];

const isProviderImportUrl = (url: URL): ImportElementSource | undefined => {
  return providers.find(({ matchUrl }) => {
    try {
      return matchUrl(url);
    } catch (err) {
      return false;
    }
  })?.name as undefined | ImportElementSource;
};

export const isImportUrl = (text: string): PromiseOrType<IsImportUrlResult> => {
  let url: URL | undefined;
  try {
    url = new URL(text.trim());
  } catch (err) {
    // not a URL
    return [false, undefined];
  }
  const provider = isProviderImportUrl(getDefined(url));
  if (provider) {
    return [true, provider];
  }

  return isRandomImportUrl(getDefined(url));
};
