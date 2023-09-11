import { getSheetRequestDataFromUrl } from './getSheetRequestDataFromUrl';

test('getSheetRequestDataFromUrl.spec', () => {
  expect(
    getSheetRequestDataFromUrl(
      new URL(
        'https://content-sheets.googleapis.com/v4/spreadsheets/spreadsheetid/values/gid1'
      )
    )
  ).toMatchInlineSnapshot(`
    Object {
      "gid": "gid1",
      "sheetId": "spreadsheetid",
    }
  `);

  expect(
    getSheetRequestDataFromUrl(
      new URL(
        'https://docs.google.com/spreadsheets/d/1ITWWhsdu66mNCr7N3CrPNTUqQStXF6JAsEdPQF7YBFU/edit#gid=3'
      )
    )
  ).toMatchInlineSnapshot(`
    Object {
      "gid": "3",
      "sheetId": "1ITWWhsdu66mNCr7N3CrPNTUqQStXF6JAsEdPQF7YBFU",
    }
  `);

  expect(
    getSheetRequestDataFromUrl(
      new URL(
        'https://docs.google.com/spreadsheets/u/1/d/1ITWWhsdu66mNCr7N3CrPNTUqQStXF6JAsEdPQF7YBFU/edit#gid=4'
      )
    )
  ).toMatchInlineSnapshot(`
    Object {
      "gid": "4",
      "sheetId": "1ITWWhsdu66mNCr7N3CrPNTUqQStXF6JAsEdPQF7YBFU",
    }
  `);
});
