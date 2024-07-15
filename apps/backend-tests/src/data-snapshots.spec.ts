/* eslint-env jest */

// existing sequential tests very granular
/* eslint-disable jest/expect-expect */
import { describe, it, expect } from 'vitest';
import { testWithSandbox as test } from '@decipad/backend-test-sandbox';
import * as DataSnapshots from '../../../libs/services/src/external-data/external-data-snapshots';

describe.sequential('Data Snapshots', () => {
  test('Data Snapshots', () => {
    const EXTERNAL_DATA_1 = 'external-data-1';
    const URL_1 = 'some-url-1';
    const URL_2 = 'some-url-2';
    const PUBLISHED_ID = 'published-id';

    it('Can save and retrieve one snapshot', async () => {
      await DataSnapshots.saveData(EXTERNAL_DATA_1, URL_1, Buffer.from('abc'));

      const data = await DataSnapshots.getLatestExternalDataSnapshot(
        EXTERNAL_DATA_1,
        URL_1
      );

      expect(data).toBeDefined();
      expect(data!.toString()).toBe('abc');
    });

    it('Updates latest snapshot', async () => {
      await DataSnapshots.saveData(EXTERNAL_DATA_1, URL_1, Buffer.from('def'));

      const data = await DataSnapshots.getLatestExternalDataSnapshot(
        EXTERNAL_DATA_1,
        URL_1
      );

      expect(data).toBeDefined();
      expect(data!.toString()).toBe('def');
    });

    it('Retrieves all the snapshots avaialble', async () => {
      const data = await DataSnapshots.getAllExternalDataSnapshotsUrl(
        EXTERNAL_DATA_1,
        URL_1
      );

      expect(data).toHaveLength(2);

      expect(data).toMatchObject([Buffer.from('def'), Buffer.from('abc')]);
      expect(data).not.toMatchObject([Buffer.from('abc'), Buffer.from('def')]);
    });

    it('Only keeps 5 snapshots', async () => {
      await DataSnapshots.saveData(EXTERNAL_DATA_1, URL_1, Buffer.from('1'));
      await DataSnapshots.saveData(EXTERNAL_DATA_1, URL_1, Buffer.from('2'));
      await DataSnapshots.saveData(EXTERNAL_DATA_1, URL_1, Buffer.from('3'));
      await DataSnapshots.saveData(EXTERNAL_DATA_1, URL_1, Buffer.from('4'));
      await DataSnapshots.saveData(EXTERNAL_DATA_1, URL_1, Buffer.from('5'));

      const data = await DataSnapshots.getAllExternalDataSnapshotsUrl(
        EXTERNAL_DATA_1,
        URL_1
      );

      expect(data).toHaveLength(5);

      expect(data).toMatchObject([
        Buffer.from('5'),
        Buffer.from('4'),
        Buffer.from('3'),
        Buffer.from('2'),
        Buffer.from('1'),
      ]);
    });

    it('Different URL with same external data has different snapshots', async () => {
      const emptyData = await DataSnapshots.getAllExternalDataSnapshotsUrl(
        EXTERNAL_DATA_1,
        URL_2
      );

      expect(emptyData).toHaveLength(0);

      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url-2_1')
      );

      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url-2_2')
      );

      const data = await DataSnapshots.getAllExternalDataSnapshotsUrl(
        EXTERNAL_DATA_1,
        URL_2
      );

      expect(data).toHaveLength(2);
      expect(data).toMatchObject([
        Buffer.from('url-2_2'),
        Buffer.from('url-2_1'),
      ]);
    });

    it('Can mark a snapshot as published', async () => {
      await DataSnapshots.setSnapshotsAsPublished(
        EXTERNAL_DATA_1,
        PUBLISHED_ID
      );

      const data1 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_1,
          PUBLISHED_ID
        );

      expect(data1).toBeDefined();
      expect(data1!.toString()).toBe('5');

      const data2 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_2,
          PUBLISHED_ID
        );

      expect(data2).toBeDefined();
      expect(data2!.toString()).toBe('url-2_2');
    });

    it('Doesnt change published versions if more are added', async () => {
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_1,
        Buffer.from('url-1_latest')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url-2_latest')
      );

      const data1 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_1,
          PUBLISHED_ID
        );

      expect(data1).toBeDefined();
      expect(data1!.toString()).toBe('5');

      const data2 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_2,
          PUBLISHED_ID
        );

      expect(data2).toBeDefined();
      expect(data2!.toString()).toBe('url-2_2');
    });

    it('Doesnt remove published snapshots if more than threshhold are added', async () => {
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_1,
        Buffer.from('url1-10')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_1,
        Buffer.from('url1-20')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_1,
        Buffer.from('url1-30')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_1,
        Buffer.from('url1-40')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_1,
        Buffer.from('url1-50')
      );

      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url2-10')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url2-20')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url2-30')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url2-40')
      );
      await DataSnapshots.saveData(
        EXTERNAL_DATA_1,
        URL_2,
        Buffer.from('url2-50')
      );

      const data1 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_1,
          PUBLISHED_ID
        );

      expect(data1).toBeDefined();
      expect(data1!.toString()).toBe('5');

      const data2 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_2,
          PUBLISHED_ID
        );

      expect(data2).toBeDefined();
      expect(data2!.toString()).toBe('url-2_2');
    });

    it('Removes old published snapshot if re-published', async () => {
      await DataSnapshots.setSnapshotsAsPublished(
        EXTERNAL_DATA_1,
        PUBLISHED_ID
      );

      const data1 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_1,
          PUBLISHED_ID
        );

      expect(data1).toBeDefined();
      expect(data1!.toString()).toBe('url1-50');

      const data2 =
        await DataSnapshots.getLatestExternalDataSnapshotWithPublish(
          EXTERNAL_DATA_1,
          URL_2,
          PUBLISHED_ID
        );

      expect(data2).toBeDefined();
      expect(data2!.toString()).toBe('url2-50');

      const allData = await DataSnapshots.getAllExternalDataSnapshots(
        EXTERNAL_DATA_1
      );

      // 5 = Max snapshots per URL
      // 2 = Total URLs used
      expect(allData).toHaveLength(5 * 2);
    });

    it('Can delete all snapshots for single external data', async () => {
      await DataSnapshots.deleteAllExternalDataSnapshots(EXTERNAL_DATA_1);

      const dataUrl1 = await DataSnapshots.getAllExternalDataSnapshotsUrl(
        EXTERNAL_DATA_1,
        URL_1
      );
      const dataUrl2 = await DataSnapshots.getAllExternalDataSnapshotsUrl(
        EXTERNAL_DATA_1,
        URL_2
      );

      expect(dataUrl1).toHaveLength(0);
      expect(dataUrl2).toHaveLength(0);
    });
  });
});
