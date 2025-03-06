import { datalake } from '@decipad/backend-config';
import { once } from '@decipad/utils';
import { Service, ServiceConfig } from '@google-cloud/common';
import { z } from 'zod';

const createProjectPolicyParser = once(() =>
  z.object({
    version: z.number(),
    etag: z.string(),
    bindings: z.array(z.any()),
  })
);

export type ProjectPolicy = z.infer<
  ReturnType<typeof createProjectPolicyParser>
>;

class CloudResourceManagerClient extends Service {
  constructor() {
    const config: ServiceConfig = {
      apiEndpoint: 'https://cloudresourcemanager.googleapis.com/v1',
      baseUrl: 'https://cloudresourcemanager.googleapis.com/v1',
      scopes: [
        'https://www.googleapis.com/auth/iam',
        'https://www.googleapis.com/auth/cloud-platform',
      ],
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

  getProjectPolicy(): Promise<ProjectPolicy> {
    return new Promise((resolve, reject) => {
      this.request(
        {
          method: 'POST',
          uri: `:getIamPolicy`,
          json: {
            options: {
              requestedPolicyVersion: 3,
            },
          },
        },
        (err, response) => {
          if (err) {
            return reject(err);
          }
          try {
            resolve(createProjectPolicyParser().parse(response));
          } catch (e) {
            reject(e);
          }
        }
      );
    });
  }
  updateProjectPolicy(policy: ProjectPolicy): Promise<void> {
    return new Promise((resolve, reject) => {
      this.request(
        {
          method: 'POST',
          uri: `:setIamPolicy`,
          json: {
            policy,
          },
        },
        (err) => {
          if (err) {
            return reject(err);
          }
          resolve();
        }
      );
    });
  }
}

export const cloudResourceManagerClient = once(
  () => new CloudResourceManagerClient()
);
