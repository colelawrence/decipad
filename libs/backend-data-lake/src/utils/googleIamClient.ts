/* eslint-disable no-console */
import { z } from 'zod';
import { Service, ServiceConfig } from '@google-cloud/common';
import { datalake } from '@decipad/backend-config';
import { dequal, getDefined, once, timeout } from '@decipad/utils';
import {
  DataSetWithAccess,
  googleBigQueryAdminClient,
} from './googleBigQueryAdminClient';
import { cloudResourceManagerClient } from './cloudResourceManagerClient';

const createServiceAccountParser = once(() =>
  z.object({
    name: z.string(),
    projectId: z.string(),
    uniqueId: z.string(),
    email: z.string(),
    displayName: z.string(),
    etag: z.string(),
    description: z.string(),
    oauth2ClientId: z.string(),
  })
);

type ServiceAccount = z.infer<ReturnType<typeof createServiceAccountParser>>;

const createCreateKeyResponseParser = once(() =>
  z.object({
    name: z.string(),
    privateKeyType: z.string(),
    privateKeyData: z.string(),
    validAfterTime: z.string().datetime(),
    validBeforeTime: z.string().datetime(),
    keyAlgorithm: z.string(),
  })
);

type CreateKeyResponse = z.infer<
  ReturnType<typeof createCreateKeyResponseParser>
>;

const createServiceAccountKeyParser = once(() =>
  z.object({
    validAfterTime: z.string().datetime(),
    validBeforeTime: z.string().datetime(),
    keyType: z.string(),
  })
);

const createServiceAccountKeysResultParser = once(() =>
  z.object({
    keys: z.array(
      z.object({
        validAfterTime: z.string().datetime(),
        validBeforeTime: z.string().datetime(),
        keyType: z.string(),
      })
    ),
  })
);

type ServiceAccountKey = z.infer<
  ReturnType<typeof createServiceAccountKeyParser>
>;

const getServiceAccountId = (workspaceId: string) =>
  `ws${workspaceId.replaceAll('-', '').replaceAll('_', '')}`;

class IAMRootClient extends Service {
  constructor() {
    const config: ServiceConfig = {
      apiEndpoint: 'https://iam.googleapis.com/v1',
      baseUrl: 'https://iam.googleapis.com/v1',
      scopes: ['https://www.googleapis.com/auth/iam'],
      packageJson: {
        name: 'google-cloud',
        version: '0.0.0',
      },
    };
    super(config, {
      credentials: datalake().rootCredentials,
    });
  }

  get __projectId() {
    return datalake().rootCredentials.project_id;
  }

  getServiceAccount(workspaceId: string): Promise<ServiceAccount> {
    return new Promise((resolve, reject) => {
      this.request(
        {
          method: 'GET',
          uri: `/serviceAccounts/${getServiceAccountId(workspaceId)}@${
            this.__projectId
          }.iam.gserviceaccount.com`,
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          try {
            resolve(createServiceAccountParser().parse(response));
          } catch (e) {
            console.warn('Error parsing service account', e);
            reject(e);
          }
        }
      );
    });
  }

  createServiceAccount(workspaceId: string): Promise<ServiceAccount> {
    return new Promise((resolve, reject) => {
      this.request(
        {
          method: 'POST',
          uri: `/serviceAccounts`,
          json: {
            accountId: getServiceAccountId(workspaceId), // just the workspace id because a service account id must be between 6 and 30 characters
            serviceAccount: {
              displayName: `Workspace ${workspaceId} serviceaccount`,
              description: `Workspace ${workspaceId} serviceaccount`,
            },
          },
        },
        (err, response) => {
          if (err) {
            if (err.message.toLowerCase().includes('already exists')) {
              // eslint-disable-next-line no-console
              console.warn('service account already exists', workspaceId);
              return this.getServiceAccount(workspaceId)
                .then(resolve)
                .catch(reject);
            }
            return reject(err);
          }
          resolve(createServiceAccountParser().parse(response));
        }
      );
    });
  }

  async getDatasetPolicy(datasetId: string) {
    console.log('getDatasetPolicy', { datasetId });
    const manager = googleBigQueryAdminClient();
    return manager.getDatasetAccessPolicy(datasetId);
  }

  async setDataSetPolicy(
    datasetId: string,
    policy: DataSetWithAccess['access']
  ) {
    const manager = googleBigQueryAdminClient();
    return manager.setDatasetAccessPolicy(datasetId, policy);
  }

  async ensureDataSetPolicy(serviceAccount: ServiceAccount, dataSetId: string) {
    const currentPolicy = await this.getDatasetPolicy(dataSetId);

    console.warn('current data set policy:', currentPolicy);

    const expectedBinding = {
      role: `READER`,
      userByEmail: `${serviceAccount.email}`,
    };
    const hasExpectedBindings = currentPolicy.some((binding) =>
      dequal(binding, expectedBinding)
    );

    if (hasExpectedBindings) {
      console.warn('binding already exists');
      return getDefined(currentPolicy);
    }

    console.warn('creating binding');

    const newPolicy = [...currentPolicy, expectedBinding];

    console.warn('setting policy for data set', dataSetId, newPolicy);
    this.setDataSetPolicy(dataSetId, newPolicy);
    console.warn('SUCCESS insetting policy for data set', dataSetId, newPolicy);
    return newPolicy;
  }

  async ensureJobCreationAccessPolicy(serviceAccount: ServiceAccount) {
    console.warn('serviceAccount:', serviceAccount);
    const client = cloudResourceManagerClient();
    const currentPolicy = await client.getProjectPolicy();
    console.warn(
      'current project policy:',
      JSON.stringify(currentPolicy, null, 2)
    );

    const expectedBinding = {
      role: `roles/bigquery.jobUser`,
      members: [`serviceAccount:${serviceAccount.email}`],
    };
    // find if the binding already exists
    const existingBinding = currentPolicy.bindings.find((binding) =>
      dequal(binding, expectedBinding)
    );

    if (existingBinding) {
      console.warn('project policy binding already exists');
      return;
    }

    console.warn('creating  project policy binding');
    const policy = {
      ...currentPolicy,
      version: 3,
      bindings: [
        ...currentPolicy.bindings.filter((b) => Object.keys(b).length > 0),
        expectedBinding,
      ],
    };
    console.warn('updating project policy', JSON.stringify(policy, null, 2));
    await client.updateProjectPolicy(policy);
    console.warn('SUCCESS in creating project policy binding');
  }

  async createServiceAccountPoliciesAndBindings(
    serviceAccount: ServiceAccount,
    dataSetId: string,
    retryCount = 0
  ) {
    try {
      // eslint-disable-next-line no-async-promise-executor
      await this.ensureDataSetPolicy(serviceAccount, dataSetId);
      await this.ensureJobCreationAccessPolicy(serviceAccount);
    } catch (err) {
      if (retryCount > 0) {
        throw err;
      }
      await timeout(2000);
      await this.createServiceAccountPoliciesAndBindings(
        serviceAccount,
        dataSetId,
        retryCount + 1
      );
    }
  }

  getServiceAccountKeys(
    serviceAccount: ServiceAccount
  ): Promise<ServiceAccountKey[]> {
    return new Promise((resolve, reject) => {
      this.request(
        {
          method: 'GET',
          uri: `/serviceAccounts/${serviceAccount.email}/keys`,
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          try {
            resolve(
              createServiceAccountKeysResultParser().parse(response).keys
            );
          } catch (e) {
            console.warn('Error parsing keys', e);
            reject(e);
          }
        }
      );
    });
  }

  async getServiceAccountKey(
    serviceAccount: ServiceAccount
  ): Promise<ServiceAccountKey | undefined> {
    const keys = await this.getServiceAccountKeys(serviceAccount);
    console.warn('service account keys', keys);
    return keys.find(
      (key) =>
        key.keyType === 'USER_MANAGED' &&
        key.validBeforeTime.startsWith('9999-') // user-created keys expire in the year 9999
    );
  }

  createServiceAccountKey(
    serviceAccount: ServiceAccount,
    forceCreation = false
  ): Promise<CreateKeyResponse | ServiceAccountKey> {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (!forceCreation) {
        const existingKey = await this.getServiceAccountKey(serviceAccount);
        if (existingKey) {
          console.warn('Already has a key');
          resolve(existingKey);
          return;
        }
      }
      console.warn('Creating key');
      this.request(
        {
          method: 'POST',
          uri: `/serviceAccounts/${serviceAccount.email}/keys`,
          json: {
            keyAlgorithm: 'KEY_ALG_RSA_2048',
          },
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          try {
            resolve(createCreateKeyResponseParser().parse(response));
          } catch (e) {
            console.warn('Error parsing key', e);
            reject(e);
          }
        }
      );
    });
  }
}

export const googleIamRootClient = () => new IAMRootClient();
