import { services } from '@architect/functions';
import { Client, type ClientOptions } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';

let memoServiceProps: undefined | { sig4service: 'es' | 'aoss'; node: string };
const getServiceProps = async () => {
  if (!memoServiceProps) {
    const discoveredServices = await services();
    memoServiceProps = discoveredServices['nasa_gcn-architect_plugin_search'];
  }

  return memoServiceProps;
};

export const searchStoreClient = async (): Promise<Client> => {
  const props = await getServiceProps();
  const node = process.env.DECI_SEARCH_URL ?? props?.node;
  if (!node) {
    throw new Error('unknown endpoint');
  }
  const options: ClientOptions = { node };
  const service = props?.sig4service;
  if (service) {
    const region = process.env.AWS_REGION;
    if (!region)
      throw new Error('environment variable AWS_REGION must be defined');
    Object.assign(
      options,
      AwsSigv4Signer({
        region,
        service,
      })
    );
  }
  if (process.env.DECI_SEARCH_USERNAME && process.env.DECI_SEARCH_PASSWORD) {
    options.auth = {
      username: process.env.DECI_SEARCH_USERNAME,
      password: process.env.DECI_SEARCH_PASSWORD,
    };
  }
  // eslint-disable-next-line no-console
  console.log('searchStoreClient:', options);
  return new Client(options);
};
