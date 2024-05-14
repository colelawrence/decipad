/* eslint-disable no-console */
import {
  Button,
  OptionsList,
  UIGoogleSheetConnection,
  cssVar,
  p13Bold,
} from '@decipad/ui';
import type { ConnectionProps } from './types';
import { type FC, useState, useMemo, useCallback, useEffect } from 'react';
import {
  type ExternalDataSourceFragmentFragment,
  useGetExternalDataSourcesWorkspaceQuery,
  useRefreshKeyMutation,
  useCreateExternalDataSourceMutation,
} from '@decipad/graphql-client';
import {
  useComputer,
  useConnectionStore,
  useGSheetConnectionStore,
} from '@decipad/react-contexts';
import { materializeResult } from '@decipad/computer';
import { type ImportParams, tryImport, getGsheetMeta } from '@decipad/import';
import styled from '@emotion/styled';
import { useCustomScript } from '@decipad/react-utils';
import { nanoid } from 'nanoid';
import { env } from '@decipad/client-env';
import { getExternalDataAuthUrl, getExternalDataUrl } from '../utils';
import { TEMP_CONNECTION_NAME } from '@decipad/frontend-config';

const Styles = {
  Trigger: styled.div({
    cursor: 'pointer',
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    borderRadius: '6px',
    height: '32px',
    border: `1px solid ${cssVar('borderSubdued')}`,
    padding: '6px',
    svg: { width: '16px', height: '16px' },
  }),
};

type CallbackResponse =
  | {
      action: 'loaded';
    }
  | {
      action: 'picked';
      docs: Array<{ url: string; name: string }>;
    };

const useGSheetConnections = (
  workspaceId: string
): Array<ExternalDataSourceFragmentFragment> => {
  const [{ data: wsDatasources }] = useGetExternalDataSourcesWorkspaceQuery({
    variables: {
      workspaceId,
    },
  });

  return useMemo(
    () =>
      wsDatasources?.getExternalDataSourcesWorkspace.filter(
        (s) => s.provider === 'gsheets'
      ) ?? [],
    [wsDatasources?.getExternalDataSourcesWorkspace]
  );
};

const SubsheetSelector: FC = () => {
  const [subsheets, selectedSubsheet, setter] = useGSheetConnectionStore(
    (s) => [s.SpreeadsheetSubsheets, s.SelectedSubsheet, s.Set]
  );

  if (subsheets.length === 1) {
    return null;
  }

  return (
    <OptionsList
      name={selectedSubsheet?.name}
      label="Select Subsheet"
      disabled={selectedSubsheet == null}
      selections={subsheets}
      onSelect={(s) => setter({ SelectedSubsheet: s })}
    />
  );
};

const SubsheetOrSelect: FC = () => {
  const [subsheets, set] = useGSheetConnectionStore((s) => [
    s.SpreeadsheetSubsheets,
    s.Set,
  ]);

  useEffect(() => {
    if (subsheets.length === 1) {
      set({ SelectedSubsheet: subsheets[0] });
    }
  }, [set, subsheets]);

  return (
    <div>
      <SubsheetSelector />
    </div>
  );
};

const ActualSheetSelector: FC<{
  externalData: ExternalDataSourceFragmentFragment;
}> = ({ externalData }) => {
  const [loaded, setLoaded] = useState(false);
  const computer = useComputer();
  const [, refreshKey] = useRefreshKeyMutation();
  const [selectedName, setter] = useGSheetConnectionStore((s) => [
    s.SelectedSheetName,
    s.Set,
  ]);

  useCustomScript('https://apis.google.com/js/api.js', () => {
    window.gapi.load('picker', () => {
      setLoaded(true);
    });
  });

  const selectGSheet = useCallback(async () => {
    async function getAccessKey(): Promise<string> {
      const externalDataKey = externalData.keys.find(
        (k) =>
          new Date(k.expiresAt).getTime() > new Date().getTime() &&
          k.access != null
      );

      if (externalDataKey != null) {
        return externalDataKey.access!;
      }

      // TODO: probably want to refresh based on the ExternalDataKeys field.
      // So we get the correct caching.
      const refreshKeyRes = await refreshKey({ id: externalData.id });
      if (refreshKeyRes.data == null) {
        throw new Error('Could not refresh this key.');
      }

      return refreshKeyRes.data?.refreshExternalDataToken;
    }

    const accessKey = await getAccessKey();

    //
    // We loaded the google library above.
    // However, we don't have very good types from google,
    // So we have to make our own where possible.
    //

    // @ts-ignore
    const googleLib: any = google;

    const picker = new googleLib.picker.PickerBuilder()
      .addView(googleLib.picker.ViewId.SPREADSHEETS)
      .setOAuthToken(accessKey)
      .setDeveloperKey(env.VITE_GOOGLESHEETS_API_KEY)
      .setCallback(async (picked: CallbackResponse) => {
        if (picked.action !== 'picked') {
          return;
        }

        const params: ImportParams = {
          provider: 'gsheets',
          computer,
          url: new URL(picked.docs[0].url),
          proxy: new URL(getExternalDataUrl(externalData.id)),
        };

        const meta = await getGsheetMeta(params);

        setter({
          OriginalUrl: picked.docs[0].url,
          SelectedSheetName: picked.docs[0].name,
          SpreeadsheetSubsheets: meta.map((s) => ({
            id: s.sheetId,
            name: s.sheetName,
          })),
        });

        picker.setVisible(false);
      })
      .build();
    picker.setVisible(true);
  }, [computer, externalData.id, externalData.keys, refreshKey, setter]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <p css={p13Bold}>Select Spreadsheet</p>
      <div css={{ display: 'flex', gap: '6px' }}>
        <Button onClick={selectGSheet} styles={{ whiteSpace: 'nowrap' }}>
          Select Spreadsheet
        </Button>
        {selectedName != null && (
          <Styles.Trigger>{selectedName}</Styles.Trigger>
        )}
        <div css={{ width: '100%' }}>
          <SubsheetOrSelect />
        </div>
      </div>
    </>
  );
};

const SheetSelector: FC<ConnectionProps> = ({ workspaceId }) => {
  const [externalDataId] = useGSheetConnectionStore((s) => [s.ExternalDataId]);

  const conn = useGSheetConnections(workspaceId);

  const externalData = useMemo(
    () => conn.find((s) => s.id === externalDataId),
    [conn, externalDataId]
  );

  if (externalData == null) {
    return null;
  }

  return <ActualSheetSelector externalData={externalData} />;
};

function OnAuth(externalDataId: string) {
  window.location.replace(getExternalDataAuthUrl(externalDataId));
}

const Connections: FC<ConnectionProps> = ({ workspaceId, getConnState }) => {
  const [externalDataName, setter, stringify] = useGSheetConnectionStore(
    (s) => [s.ExternalDataName, s.Set, s.Stringify]
  );

  const conn = useGSheetConnections(workspaceId);

  const [, createDataSource] = useCreateExternalDataSourceMutation();

  async function OnConnectIntegration() {
    const res = await createDataSource({
      dataSource: {
        externalId: nanoid(),
        provider: 'gsheets',
        workspaceId,

        name: TEMP_CONNECTION_NAME,
      },
    });

    const externalData = res.data?.createExternalDataSource;

    if (externalData == null) {
      throw new Error('External data returned null');
    }

    const connState = getConnState();
    const gsheetState = stringify();

    const url = new URL(window.location.href);
    url.searchParams.set('connection', connState);
    url.searchParams.set('integration', gsheetState);

    window.history.pushState(null, '', url.toString());

    OnAuth(externalData.id);
  }

  return (
    <OptionsList
      name={externalDataName}
      label="Select Google Connection"
      selections={conn}
      extraOption={{
        callback: OnConnectIntegration,
        label: '+ Add New Connection',
      }}
      onSelect={(s) =>
        setter({ ExternalDataId: s.id, ExternalDataName: s.name })
      }
    />
  );
};

export const GoogleSheetConnection: FC<ConnectionProps> = (props) => {
  const setter = useConnectionStore((s) => s.Set);
  const [selectedSubsheet, externalDataId, originalUrl, gsheetSetter] =
    useGSheetConnectionStore((s) => [
      s.SelectedSubsheet,
      s.ExternalDataId,
      s.OriginalUrl,
      s.Set,
    ]);

  const computer = useComputer();

  useEffect(() => {
    if (selectedSubsheet == null) {
      return;
    }

    async function importResult() {
      if (externalDataId == null || originalUrl == null) {
        throw new Error('Cannot be null here');
      }

      const params: ImportParams = {
        provider: 'gsheets',
        computer,
        url: new URL(originalUrl),
        proxy: new URL(getExternalDataUrl(externalDataId)),
      };

      const res = await tryImport(params, {
        subId: selectedSubsheet?.id,
        useFirstRowAsHeader: true,
      });

      const mRes = await materializeResult(res[0].result!);
      const rawResult = JSON.stringify({
        body:
          typeof res[0].rawResult === 'string'
            ? JSON.parse(res[0].rawResult)
            : res[0].rawResult,
      });

      setter({ rawResult, resultPreview: mRes });
      gsheetSetter({ SpreadsheetURL: res[0].meta?.sourceUrl?.toString() });
    }

    importResult();
  }, [
    computer,
    externalDataId,
    gsheetSetter,
    originalUrl,
    selectedSubsheet,
    setter,
  ]);

  return (
    <UIGoogleSheetConnection>
      <Connections {...props} />
      <SheetSelector {...props} />
    </UIGoogleSheetConnection>
  );
};
