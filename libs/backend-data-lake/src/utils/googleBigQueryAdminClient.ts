import { datalake } from '@decipad/backend-config';
import { once } from '@decipad/utils';
import { Service, ServiceConfig } from '@google-cloud/common';
import { z } from 'zod';

const createDataSetParser = once(() =>
  z.object({
    access: z.array(
      z.object({
        role: z.string().optional(),
        userByEmail: z.string().optional(),
        groupByEmail: z.string().optional(),
        domain: z.string().optional(),
        specialGroup: z.string().optional(),
        iamMember: z.string().optional(),
        view: z.object({}).optional(),
        routine: z.object({}).optional(),
        dataset: z.object({}).optional(),
        condition: z.object({}).optional(),
      })
    ),
  })
);

export type DataSetWithAccess = z.infer<ReturnType<typeof createDataSetParser>>;

class GoogleBigQueryAdminClient extends Service {
  // https://cloud.google.com/bigquery/docs/control-access-to-resources-iam#api
  // https://cloud.google.com/bigquery/docs/reference/rest/v2/datasets/get

  constructor() {
    const config: ServiceConfig = {
      apiEndpoint: 'https://bigquery.googleapis.com/bigquery/v2',
      baseUrl: 'https://bigquery.googleapis.com/bigquery/v2',
      scopes: ['https://www.googleapis.com/auth/bigquery'],
      packageJson: {
        name: 'google-cloud',
        version: '0.0.0',
      },
    };
    super(config, {
      credentials: datalake().rootCredentials,
    });
  }

  getDatasetAccessPolicy(
    dataSetId: string
  ): Promise<DataSetWithAccess['access']> {
    return new Promise((resolve, reject) => {
      this.request(
        {
          method: 'GET',
          uri: `/datasets/${dataSetId}?accessPolicyVersion=3`,
        },
        (err, resp) => {
          if (err) {
            reject(err);
            return;
          }
          try {
            return resolve(createDataSetParser().parse(resp).access);
          } catch (err2) {
            reject(err2);
          }
        }
      );
    });
  }

  setDatasetAccessPolicy(
    dataSetId: string,
    policy: DataSetWithAccess['access']
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      this.request(
        {
          method: 'PATCH',
          uri: `/datasets/${dataSetId}?accessPolicyVersion=3`,
          json: {
            access: policy,
          },
          maxRetries: 3,
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
  }
}

export const googleBigQueryAdminClient = once(
  () => new GoogleBigQueryAdminClient()
);
