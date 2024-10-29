/* eslint-disable no-param-reassign */
import { Button, Input, OptionsList } from '@decipad/ui';
import { FC, useCallback, useState } from 'react';
import { ConnectionProps } from '../types';
import { useCustomScript } from '@decipad/react-utils';
import { useRefreshKeyMutation } from '@decipad/graphql-client';
import { env } from '@decipad/client-env';
import { getExternalDataUrl } from '../../utils';
import { ImportParams, getGsheetMeta } from '@decipad/import';
import { useComputer } from '@decipad/editor-hooks';
import { assert, assertInstanceOf } from '@decipad/utils';
import { GSheetRunner } from '../../runners';

type CallbackResponse =
  | {
      action: 'loaded';
    }
  | {
      action: 'picked';
      docs: Array<{ url: string; name: string }>;
    };

const SubsheetSelector: FC<{
  name: string;
  subsheets: Array<{ id: string | number; name: string }> | undefined;
  setSubsheet: (_: { id: string | number; name: string }) => void;
}> = ({ name, subsheets = [], setSubsheet }) => {
  return (
    <OptionsList
      name={name}
      label="Select Subsheet"
      disabled={subsheets.length === 0}
      selections={subsheets}
      onSelect={setSubsheet}
    />
  );
};

const SUBSHEET_CACHE = new Map<
  string,
  Array<{ id: string | number; name: string }>
>();

const ActualSheetSelector: FC<ConnectionProps> = ({
  externalData: _externalData,
  onRun,
  runner,
}) => {
  assertInstanceOf(runner, GSheetRunner);
  assert(_externalData != null, 'External data should never be null here');
  const externalData = _externalData;

  const [loaded, setLoaded] = useState(false);

  const [, refreshKey] = useRefreshKeyMutation();
  const computer = useComputer();

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
        const mappedSubsheets = meta.map((m) => ({
          id: m.sheetId,
          name: m.sheetName,
        }));

        SUBSHEET_CACHE.set(
          new URL(picked.docs[0].url).pathname,
          mappedSubsheets
        );

        assertInstanceOf(runner, GSheetRunner);

        runner.setOptions({ runner: { spreadsheetUrl: picked.docs[0].url } });
        runner.setResourceName({
          sheet: picked.docs[0].name,
          subsheet: mappedSubsheets[0].name,
        });

        runner.setExternalDataId(externalData.id);

        onRun();

        picker.setVisible(false);
      })
      .build();
    picker.setVisible(true);
  }, [computer, externalData, onRun, refreshKey, runner]);

  if (!loaded) {
    return null;
  }

  return (
    <>
      <h3>Select Spreadsheet</h3>
      <div css={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <Button onClick={selectGSheet} styles={{ whiteSpace: 'nowrap' }}>
          Select Spreadsheet
        </Button>
        {runner.resourceName != null && (
          <Input disabled variant="small" value={runner.resourceName.sheet} />
        )}
        {runner.resourceName != null && (
          <div css={{ width: '100%' }}>
            <SubsheetSelector
              name={runner.resourceName.subsheet}
              subsheets={
                SUBSHEET_CACHE.get(
                  new URL(runner.options.runner.spreadsheetUrl!).pathname
                ) ?? []
              }
              setSubsheet={(s) => {
                const url = new URL(runner.options.runner.spreadsheetUrl!);
                url.hash = `gid=${s.id.toString()}`;
                runner.setOptions({
                  runner: { spreadsheetUrl: url.toString() },
                });
                runner.setResourceName({ subsheet: s.name });

                onRun();
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export const SheetSelector: FC<ConnectionProps> = (props) => {
  if (props.externalData == null) {
    return null;
  }

  return <ActualSheetSelector {...props} />;
};
