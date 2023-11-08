#!/usr/bin/env node
const { stringify } = require('yaml');
const process = require('node:process');

const domain = process.env.DECI_DOMAIN;
if (!domain) {
  // eslint-disable-next-line no-console
  console.error('Must have a DECI_DOMAIN env var');
  process.exit(1);
}

const spec = (paths, schemas) => ({
  openapi: '3.0.1',
  info: {
    title: 'Create and modify a Decipad notebook',
    description: `Create and modify a Decipad notebook where you can build a numerical model, adding and manipulating text, tables, data views, sliders.
Column names and variable names must not have spaces or weird characters in them.`,
    version: 'v1',
  },
  servers: [
    {
      url: domain,
    },
  ],
  paths,
  components: {
    schemas: {
      CreateResult: {
        type: 'object',
        properties: {
          createdElementId: {
            type: 'string',
          },
          createdElementType: {
            type: 'string',
          },
          createdElementName: {
            type: 'string',
          },
        },
      },
      CreateResults: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            createdElementId: {
              type: 'string',
            },
            createdElementType: {
              type: 'string',
            },
            createdElementName: {
              type: 'string',
            },
          },
        },
      },
      AnyElement: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
          },
          type: {
            type: 'string',
          },
        },
      },
      ...schemas,
    },
  },
});

const commonResponses = {}; // TODO: fill this

const buildResponses = (responses) => ({
  ...commonResponses,
  ...Object.fromEntries(
    Object.entries(responses).map(([responseName, response]) => {
      const { schema, schemaName, ...rest } = response;
      const finalSchema = schemaName
        ? {
            $ref: `#/components/schemas/${response.schemaName}`,
          }
        : schema;
      const r = {
        ...rest,
      };
      if (finalSchema) {
        r.content = {
          'application/json': {
            schema: finalSchema,
          },
        };
      }
      return [responseName, r];
    })
  ),
});

const notebookIdParameter = {
  name: 'notebookId',
  in: 'query',
  description: 'the notebook id',
  required: true,
  schema: {
    type: 'string',
  },
};

const buildActionParameters = (_parameters, requiresNotebook) => {
  const parameters = [..._parameters];
  if (requiresNotebook) {
    parameters.push(notebookIdParameter);
  }
  return parameters;
};

const buildRequestBody = (requestBody) => {
  if (requestBody) {
    return {
      content: {
        'application/json': requestBody,
      },
    };
  }
};

const buildActionPath = (actionName, actionDef) => {
  // eslint-disable-next-line no-console
  const action = {
    summary: actionDef.summary,
    description: actionDef.description || actionDef.summary,
    operationId: actionName,
    responses: buildResponses(actionDef.responses),
    parameters: buildActionParameters(
      actionDef.parameters ?? [],
      actionDef.requiresNotebook
    ),
  };
  if (actionDef.requestBody) {
    action.requestBody = buildRequestBody(actionDef.requestBody);
  }
  return [
    `/api/notebook/${actionName}`,
    {
      post: action,
    },
  ];
};

const { actions } = require('../build/index');

const buildPaths = () => {
  const actionNames = Object.keys(actions);
  return Object.fromEntries(
    actionNames.map((actionName) =>
      buildActionPath(actionName, actions[actionName])
    )
  );
};

const buildSchema = (actionName, actionDef, schemas) => {
  const { responses } = actionDef;
  if (responses) {
    for (const resp of Object.values(responses)) {
      const { schema, schemaName } = resp;
      if (schemaName && schema) {
        // eslint-disable-next-line no-param-reassign
        schemas[schemaName] = schema;
      }
    }
  }
};

const buildSchemas = () => {
  const schemas = {};
  // eslint-disable-next-line guard-for-in
  for (const actionName of Object.keys(actions)) {
    buildSchema(actionName, actions[actionName], schemas);
  }
  return schemas;
};

// pass it through JSON to remove any remaining artifacts from the object
const finalSpec = JSON.parse(
  JSON.stringify(spec(buildPaths(), buildSchemas()))
);

process.stdout.write(stringify(finalSpec));
