/* eslint-disable no-console */
/* eslint-disable no-param-reassign */

const {getLambdaName, toLogicalID } = require('@architect/utils');

const getConfig = ({arc, inventory}) => {
  const lambdaUrls = (arc['lambda-urls'] ?? []).map((lambda) => lambda.join(' '));
  const lambdas = Object.fromEntries(lambdaUrls.map((lambda) => {
    const lambdaDef = inventory.get.http(lambda);
    if (!lambdaDef) {
      throw new Error(`Lambda ${lambda} not found`);
    }
    return [lambda, lambdaDef];
  }));
  return lambdas;
};

const getLambdaLogicalId = (lambdaDef) => {
  const lambdaName = getLambdaName(lambdaDef.path);
  return toLogicalID(`${lambdaDef.method}${lambdaName.replace(/000/g, '')}HTTPLambda`)
}

const getLambdaURLLogicalId = (lambdaDef) => {
  const lambdaLogicalId = getLambdaLogicalId(lambdaDef);
  return `${lambdaLogicalId}URL`
}

const lambdaUrl = (lambdaDef, stage) => {
  if (stage !== 'testing') {
    return {
      'Fn::GetAtt': [getLambdaURLLogicalId(lambdaDef), 'FunctionUrl']
    }
  }
  return `https://${getLambdaName(lambdaDef.path)}-${stage}.decipad.com`;
}

const createURLLambdaResource = (cloudformation, lambdaDef) => {
  const lambdaLogicalId = getLambdaLogicalId(lambdaDef);
  const lambdaURLLogicalId = getLambdaURLLogicalId(lambdaDef);
  cloudformation.Resources[lambdaURLLogicalId] = {
    Type: 'AWS::Lambda::Url',
    DependsOn: 'Role',
    Properties: {
      AuthType: 'NONE',
      Cors: {
        AllowCredentials: true,
        // TODO: FIX THIS, do not allow all headers from all origins
        AllowHeaders: ['*'],
        ExposeHeaders: ['*'],
        AllowMethods: ['*'],
        AllowOrigins: ['*'],
        MaxAge: 6000
      },
      InvokeMode: 'RESPONSE_STREAM',
      TargetFunctionArn: {
        'Fn::GetAtt': [lambdaLogicalId, 'Arn']
      }
    }
  };
  return cloudformation;
}

const deploy = {
  start: async ({arc, inventory, cloudformation}) => {
    const lambdas = getConfig({arc, inventory});
    for (const [, lambdaDef] of Object.entries(lambdas)) {
      createURLLambdaResource(cloudformation, lambdaDef);
      // createResourceBasedPolicyToEnableInvokingLambdaURLs(cloudformation, lambdaDef);
    }
    return cloudformation;
  },
  services: ({arc, inventory, stage }) => {
    const lambdas = getConfig({arc, inventory});
    console.log(lambdas);
    return Object.fromEntries(Object.values(lambdas).map((lambdaDef) => {
      return [getLambdaLogicalId(lambdaDef), lambdaUrl(lambdaDef, stage)];
    }));
  }
}

const sandbox = {
  start() {
    return Promise.resolve();
  },
  end() {
    return Promise.resolve();
  }
}

module.exports = {
  deploy,
  sandbox
}