import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { s3 as s3Config } from '@decipad/backend-config';
import { ExternalDataSourceSnapshotRecord } from '@decipad/backendtypes';
import tables from '@decipad/tables';
import Boom from '@hapi/boom';
import { nanoid } from 'nanoid';

/**
 * EXTERNAL DATA SNAPSHOTS
 *
 * What are they?
 *
 * When you request data from an external data as the owner of that external-data,
 * you will be able to request fresh data straight from the source.
 *
 * However, readers will not be able to (rightfully so), because they don't have access
 * to that external data.
 *
 * The solution, is to save snapshots of the external data as you go.
 * 1. The owner requests data from an external source.
 * 2. That data is captured and stored in S3 on our side.
 * 3. A readers opens a notebook and attempts to read the external data
 * 4. Instead of attempting to request the actual external source, we send them the
 *    latest up to data snapshot.
 *
 * Some considerations
 * - An external data could have multiple requests. (Metadata + real data for example).
 * - We save a max of 5, to avoid cluttering our S3 buckets with stale data.
 * - Upon deletion of the external data (graphql-side), we delete all snapshots.
 * - Currently, we don't count this as storage.
 */

// We could potentially increase this for premium users.
const MAX_SNAPSHOT_NUMBER = 5;

function getUrl(url: string | undefined): string {
  return url ?? 'null';
}

/**
 * @returns all the external data snapshots from the table,
 * sorted by data (newest first), so you can check `.at(0)`, to get,
 * the latest snapshot.
 */
async function getSortedExternalDataSnapshotRecords(
  externalDataId: string,
  url: string | undefined
): Promise<Array<ExternalDataSourceSnapshotRecord>> {
  const data = await tables();

  const { Items: externalDataSnapshots } =
    await data.externaldatasnapshots.query({
      IndexName: 'byExternalData',
      KeyConditionExpression:
        'external_data_id = :external_data_id AND external_data_url = :external_data_url',
      ExpressionAttributeValues: {
        ':external_data_id': externalDataId,
        ':external_data_url': getUrl(url),
      },
    });

  externalDataSnapshots.sort((a, b) => b.createdAt! - a.createdAt!);

  return externalDataSnapshots;
}

async function getSortedExternalDataPublishedRecord(
  externalDataId: string,
  url: string | undefined,
  publishedId: string
): Promise<Array<ExternalDataSourceSnapshotRecord>> {
  const data = await tables();

  const { Items: externalDataSnapshots } =
    await data.externaldatasnapshots.query({
      IndexName: 'byExternalData',
      KeyConditionExpression:
        'external_data_id = :external_data_id AND external_data_url = :external_data_url',
      FilterExpression: 'published_snapshot_id = :published_snapshot_id',
      ExpressionAttributeValues: {
        ':external_data_id': externalDataId,
        ':external_data_url': getUrl(url),
        ':published_snapshot_id': publishedId,
      },
    });

  externalDataSnapshots.sort((a, b) => b.createdAt! - a.createdAt!);

  return externalDataSnapshots;
}

/**
 * @returns all the external data snapshots for an external data
 * for any URL.
 *
 * @see `getSortedExternalDataSnapshotRecords`, for a similar function.
 */
async function getAllSortedExternalDataRecords(
  externalDataId: string
): Promise<Array<ExternalDataSourceSnapshotRecord>> {
  const data = await tables();

  const { Items: externalDataSnapshots } =
    await data.externaldatasnapshots.query({
      IndexName: 'byExternalData',
      KeyConditionExpression: 'external_data_id = :external_data_id',
      ExpressionAttributeValues: {
        ':external_data_id': externalDataId,
      },
    });

  externalDataSnapshots.sort((a, b) => b.createdAt! - a.createdAt!);

  return externalDataSnapshots;
}

async function getDataFromS3(key: string): Promise<Buffer> {
  const { buckets, ...config } = s3Config();
  const s3 = new S3Client(config);

  const command = new GetObjectCommand({
    Bucket: buckets.externalDataSnapshots,
    Key: key,
  });

  const { Body } = await s3.send(command);

  if (Body == null) {
    throw Boom.badRequest('Could not find snapshot of the data.');
  }

  return Buffer.from(await Body.transformToByteArray());
}

async function maybeDeleteOldestSnapshot(
  externalDataId: string,
  url: string | undefined
): Promise<void> {
  const { buckets, ...config } = s3Config();
  const s3 = new S3Client(config);
  const data = await tables();

  const externalDataSnapshots = await getSortedExternalDataSnapshotRecords(
    externalDataId,
    url
  );

  const filteredExternalDataSnapshots = externalDataSnapshots.filter(
    (s) => s.published_snapshot_id == null
  );

  if (filteredExternalDataSnapshots.length < MAX_SNAPSHOT_NUMBER) {
    return;
  }

  await Promise.all(
    filteredExternalDataSnapshots
      .slice(MAX_SNAPSHOT_NUMBER - 1)
      .map(async (s) => {
        const command = new DeleteObjectCommand({
          Bucket: buckets.externalDataSnapshots,
          Key: s.resource_uri,
        });

        await s3.send(command);

        await data.externaldatasnapshots.delete({ id: s.id });
      })
  );
}

/**
 * Save the data from requesting an external data.
 *
 * Whilst checking for n-number of previously saved items, so we
 * don't create a tone of stuff on S3.
 */
export async function saveData(
  externalDataId: string,
  url: string | undefined,
  snapshot: Buffer
): Promise<void> {
  await maybeDeleteOldestSnapshot(externalDataId, url);

  const { buckets, ...config } = s3Config();

  const data = await tables();
  const s3 = new S3Client(config);

  const snapshotCreationTime = Date.now();
  const externalDataSnapshotId = nanoid();
  const externalDataS3Key = `${externalDataSnapshotId}_${snapshotCreationTime}`;

  const command = new PutObjectCommand({
    Bucket: buckets.externalDataSnapshots,
    Key: externalDataS3Key,

    Body: snapshot,
  });

  await s3.send(command);

  await data.externaldatasnapshots.put({
    id: externalDataSnapshotId,
    external_data_id: externalDataId,
    external_data_url: getUrl(url),
    resource_uri: externalDataS3Key,
    createdAt: snapshotCreationTime,
  });
}

/**
 * Retrieves the data from the latest saved snapshot.
 * It is possible that there isn't any saved snapshot, although this is fairly unlikely.
 */
export async function getLatestExternalDataSnapshot(
  externalDataId: string,
  url: string | undefined
): Promise<Buffer | undefined> {
  const externalDataSnapshots = await getSortedExternalDataSnapshotRecords(
    externalDataId,
    url
  );
  const latestSource = externalDataSnapshots.at(0);

  // We couldn't find any snapshot from this external data.
  // This can mean it never got saved, or got cleaned up.
  if (latestSource == null) {
    return undefined;
  }

  return getDataFromS3(latestSource.resource_uri);
}

/**
 * Takes into account `publishedId`.
 * @see `getLatestExternalDataSnapshot`
 */
export async function getLatestExternalDataSnapshotWithPublish(
  externalDataId: string,
  url: string | undefined,
  publishedId: string
): Promise<Buffer | undefined> {
  const externalDataSnapshots = await getSortedExternalDataPublishedRecord(
    externalDataId,
    url,
    publishedId
  );
  const latestSource = externalDataSnapshots.at(0);

  // We couldn't find any snapshot from this external data.
  // This can mean it never got saved, or got cleaned up.
  if (latestSource == null) {
    return undefined;
  }

  return getDataFromS3(latestSource.resource_uri);
}

/**
 * @returns all the buffers (in descending creation time order), for a specific externalDataId + Url pair
 */
export async function getAllExternalDataSnapshotsUrl(
  externalDataId: string,
  url: string | undefined
): Promise<Array<Buffer>> {
  const externalDataSnapshots = await getSortedExternalDataSnapshotRecords(
    externalDataId,
    url
  );

  return Promise.all(
    externalDataSnapshots.map((s) => getDataFromS3(s.resource_uri))
  );
}

/**
 * @returns all the buffers (in descending creation time order), for external data (ignoring URLs).
 */
export async function getAllExternalDataSnapshots(
  externalDataId: string
): Promise<Array<Buffer>> {
  const externalDataSnapshots = await getAllSortedExternalDataRecords(
    externalDataId
  );

  return Promise.all(
    externalDataSnapshots.map((s) => getDataFromS3(s.resource_uri))
  );
}

/**
 * Removes all data snapshots from a specific externalDataId
 *
 * This will remove them from DynamoDB and S3, be careful when using it.
 */
export async function deleteAllExternalDataSnapshots(
  externalDataId: string
): Promise<void> {
  const { buckets, ...config } = s3Config();
  const s3 = new S3Client(config);
  const data = await tables();

  const externalDataSnapshots = await getAllSortedExternalDataRecords(
    externalDataId
  );

  await Promise.all(
    externalDataSnapshots.map(async (s) => {
      const command = new DeleteObjectCommand({
        Bucket: buckets.externalDataSnapshots,
        Key: s.resource_uri,
      });

      await s3.send(command);
      await data.externaldatasnapshots.delete({ id: s.id });
    })
  );
}

/**
 * Looks at all latest external data snapshots and.
 * 1. Gets all latest snapshot for all URLs
 * 2. Remove published tag from old published snapshots (if any exist)
 * 3. Adds published ID tag to mark these as published.
 * 4. Run deletion process to clean up old snapshots if needed.
 */
export async function setSnapshotsAsPublished(
  externalDataId: string,
  publishedId: string
): Promise<void> {
  const data = await tables();

  const savedSnapshots = await getAllSortedExternalDataRecords(externalDataId);

  // Gets all latest snapshot for all URLs

  const snapshotsToPublish: Array<ExternalDataSourceSnapshotRecord> = [];
  const urlFound = new Set<string>();

  for (const record of savedSnapshots) {
    if (urlFound.has(record.external_data_url)) {
      continue;
    }

    urlFound.add(record.external_data_url);
    snapshotsToPublish.push(record);
  }

  // Remove published tag from old published snapshots (if any exist)
  await Promise.all(
    savedSnapshots
      .filter((s) => s.published_snapshot_id === publishedId)
      .map(async (s) => {
        s.published_snapshot_id = undefined;
        await data.externaldatasnapshots.put(s);
      })
  );

  for (const record of snapshotsToPublish) {
    record.published_snapshot_id = publishedId;
  }

  await Promise.all(snapshotsToPublish.map(data.externaldatasnapshots.put));

  // Run deletion process to clean up old snapshots if needed
  await Promise.all(
    Array.from(urlFound.keys()).map((key) =>
      maybeDeleteOldestSnapshot(externalDataId, key)
    )
  );
}
