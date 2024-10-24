import { IntegrationTypes } from '@decipad/editor-types';
import { Options, Runner } from './runner';
import { assert } from '@decipad/utils';
import { stringify } from 'querystring';
import { thirdParty } from '@decipad/client-config';
import {
  SheetMeta,
  getExternalDataUrl,
  getSheetRequestDataFromUrl,
} from '../utils';

type T = 'gSheets';
type O = Omit<IntegrationTypes.GoogleSheetIntegration, 'type'>;

export class GSheetRunner extends Runner<T, O> {
  public type = 'gSheets' as const;

  public externalDataId: string | undefined = undefined;
  public resourceName: { sheet: string; subsheet: string } | undefined =
    undefined;

  public assertedOptions(): Pick<Options<T, O>, 'runner' | 'importer'> {
    assert(this.options.runner.spreadsheetUrl != null);

    return this.options as Pick<Options<T, O>, 'runner' | 'importer'>;
  }
  public intoIntegrationType(): IntegrationTypes.IntegrationTypes {
    const options = this.assertedOptions();
    return {
      type: 'gsheets',
      ...options.runner,
    };
  }

  public setUrl(url: string) {
    this.options.runner.spreadsheetUrl = url;
  }

  public setExternalDataId(externalDataId: string) {
    this.externalDataId = externalDataId;
  }
  public setResourceName(resourceName: Partial<GSheetRunner['resourceName']>) {
    this.resourceName = {
      sheet: '',
      subsheet: '',
      ...this.resourceName,
      ...resourceName,
    };
  }

  private getDataURL(
    sheetId: string,
    gid: number,
    sheetMeta: SheetMeta
  ): string {
    const { googleSheets } = thirdParty();
    const queryString = stringify({
      majorDimension: 'COLUMNS',
      valueRenderOption: 'UNFORMATTED_VALUE',
      dateTimeRenderOption: 'FORMATTED_STRING',
      key: googleSheets.apiKey,
    });

    const subSheet =
      sheetMeta.sheets.find((sheet) => sheet.properties.sheetId === gid) ??
      sheetMeta.sheets[gid];

    const subSheetName =
      (subSheet?.properties.title &&
        encodeURIComponent(subSheet.properties.title)) ??
      gid;

    const dataUrl = `https://content-sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${subSheetName}?${queryString}`;

    if (this.externalDataId == null) {
      return dataUrl;
    }

    return getExternalDataUrl(this.externalDataId, { url: dataUrl });
  }

  private async fetchSheetMetaData(): Promise<SheetMeta> {
    const options = this.assertedOptions();

    const { sheetId } = getSheetRequestDataFromUrl(
      new URL(options.runner.spreadsheetUrl)
    );

    const { googleSheets } = thirdParty();
    const queryString = stringify({
      key: googleSheets.apiKey,
    });

    return fetch(
      this.externalDataId
        ? getExternalDataUrl(this.externalDataId, {
            url: `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?${queryString}`,
          })
        : `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?${queryString}`
    ).then((res) => res.json());
  }
  protected async fetchData(): Promise<Uint8Array> {
    const options = this.assertedOptions();
    const { sheetId, gid } = getSheetRequestDataFromUrl(
      new URL(options.runner.spreadsheetUrl)
    );

    const meta = await this.fetchSheetMetaData();
    const dataUrl = this.getDataURL(sheetId, gid, meta);

    const res = await fetch(dataUrl);
    if (res.status !== 200) {
      const json = await res.json().catch((_) => ({}));
      console.error('failed to get gsheets data: ', json);
      throw new Error(
        `Failed to fetch Google Sheets data - got status code ${res.status}`
      );
    }
    return res.arrayBuffer().then((arr) => new Uint8Array(arr));
  }
}
