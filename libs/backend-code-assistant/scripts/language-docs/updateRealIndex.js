#!/usr/bin/env node
/* eslint-disable global-require */
/* eslint-disable no-console */

const stackName = process.argv[2];
if (!stackName) {
  console.error('Need stack name');
  process.exit(-1);
  return;
}

const getSearchResourceId = async (nextToken) => {
  const {
    CloudFormationClient,
    ListStackResourcesCommand,
  } = require('@aws-sdk/client-cloudformation'); // CommonJS import
  const client = new CloudFormationClient();
  const input = {
    // ListStackResourcesInput
    StackName: stackName,
    NextToken: nextToken,
  };
  const command = new ListStackResourcesCommand(input);
  const response = await client.send(command);

  for (const resource of response.StackResourceSummaries) {
    if (resource.ResourceType === 'AWS::OpenSearchService::Domain') {
      return resource.PhysicalResourceId;
    }
  }

  if (response.NextToken) {
    return getSearchResourceId(response.NextToken);
  }
};

const getSearchEndpointFromResource = async (resourceId) => {
  const {
    OpenSearchClient,
    DescribeDomainCommand,
  } = require('@aws-sdk/client-opensearch'); // CommonJS import
  const client = new OpenSearchClient();
  const input = {
    // DescribeDomainRequest
    DomainName: resourceId,
  };
  const command = new DescribeDomainCommand(input);
  const response = await client.send(command);
  return response.DomainStatus.Endpoint;
};

const getSearchEndpoint = async () => {
  const searchResourceId = await getSearchResourceId();
  if (!searchResourceId) {
    console.error(`Could not find search resource id in stack ${stackName}`);
    process.exit(-1);
  }
  console.log(`OpenSearch physical resource id is ${searchResourceId}`);
  const endpoint = await getSearchEndpointFromResource(searchResourceId);
  if (!endpoint) {
    console.error(`Could not find search endpoint in ${searchResourceId}`);
    process.exit(-1);
  }
  console.log('OpenSearch endpoint:', endpoint);
  return `https://${endpoint}`;
};

const createClient = async () => {
  const { Client } = require('@opensearch-project/opensearch');
  const { AwsSigv4Signer } = require('@opensearch-project/opensearch/aws');
  const region = process.env.AWS_REGION;
  if (!region) {
    console.error(`Need AWS_REGION env var set`);
    process.exit(-1);
  }
  return new Client({
    node: await getSearchEndpoint(),
    ...AwsSigv4Signer({ region }),
  });
};

(async () => {
  const { indexLanguageDocs } = require('./indexLanguageDocs');
  const client = await createClient();
  const {
    createInitialSearchIndexes,
  } = require('../../config/createinitialSearchIndexes');
  await createInitialSearchIndexes(client);
  await indexLanguageDocs(client);
})();
