import { useCallback, useContext } from 'react';
import type { Context } from 'react';
import { useToast } from '@decipad/toast';
import { useTEditorRef } from '@decipad/editor-types';
import type { ImportElementSource } from '@decipad/editor-types';
import type {
  ExternalDataSource,
  ExternalDataSourcesContextValue,
} from '@decipad/interfaces';
import { PromiseOrType } from '@decipad/utils';

interface UseLiveConnectionAuthProps {
  provider?: ImportElementSource;
  externalId: string;
  beforeAuthenticate: (source: ExternalDataSource) => PromiseOrType<void>;
  context: Context<ExternalDataSourcesContextValue>;
}

interface LiveConnectionAuthResult {
  authenticate: () => void;
}

const authUrl = (source: ExternalDataSource): URL => {
  const url = new URL(source.authUrl);
  url.searchParams.set('redirect_uri', window.location.href);
  return url;
};

export const useLiveConnectionAuth = ({
  provider,
  externalId,
  beforeAuthenticate,
  context,
}: UseLiveConnectionAuthProps): LiveConnectionAuthResult => {
  const { externalDataSources, createExternalDataSource } = useContext(context);
  const editor = useTEditorRef();

  const toast = useToast();
  const authenticate = useCallback(async () => {
    try {
      if (!provider) {
        return;
      }
      const sources = externalDataSources;
      let source: ExternalDataSource | undefined = sources.find(
        (s) => s.provider === provider && s.keys.length > 0
      );
      if (!source) {
        source = await createExternalDataSource({
          name: `${source} for notebook ${editor.id}`,
          padId: editor.id,
          provider,
          externalId,
        });
      }
      await beforeAuthenticate(source);
      window.location.replace(authUrl(source));
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  }, [
    beforeAuthenticate,
    createExternalDataSource,
    editor.id,
    externalDataSources,
    externalId,
    provider,
    toast,
  ]);

  return { authenticate };
};
