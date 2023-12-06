import { ZodOpenApiRequestBodyObject, createDocument } from 'zod-openapi';
import { SchemaObject } from 'zod-openapi/lib-types/openapi3-ts/dist/oas30';
import { Action, actions } from './actions';
import { NotebookOpenApi } from './types';
import { ChatCompletionCreateParams } from 'openai/resources';

const getSchema = <T extends keyof NotebookOpenApi>(
  action: Action<T>
): SchemaObject | undefined => {
  return (
    createDocument({
      openapi: '3.1.0',
      info: {
        title: 'Create and modify a Decipad notebook',
        description: `Create and modify a Decipad notebook where you can build a numerical model, adding and manipulating text, tables, data views, sliders.
  Column names and variable names must not have spaces or weird characters in them.`,
        version: 'v1',
      },
      servers: [
        {
          url: 'http://localhost:3000',
        },
      ],
      paths: {
        '/fakepath': {
          post: {
            requestBody: {
              content: {
                'application/json': {
                  schema: action.parameterSchema(),
                },
              },
            },
            responses: {},
          },
        },
      },
    }).paths?.['/fakepath']?.post?.requestBody as
      | ZodOpenApiRequestBodyObject
      | undefined
  )?.content?.['application/json']?.schema as SchemaObject | undefined;
};

// ! These actions are not very stable right now, so we omit them from the OpenAPI schema
const OMITTED_ACTIONS = [
  'describeAllNotebookElements',
  'appendPlot',
  'changeText',
  'getElementById',
  'removeElement',
  'removeTableColumn',
  'removeTableRow',
  'setPlotParams',
];

const definedActions = (useOmitted: boolean) =>
  Object.entries(actions).filter(
    ([name, func]) =>
      func != null && (useOmitted || !OMITTED_ACTIONS.includes(name))
  );

export function getOpenApiSchema(useOmitted: boolean): Array<SchemaObject> {
  return definedActions(useOmitted).map(([name, func]) => ({
    name,
    description: func.summary,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: getSchema(func as Action<any>),
  }));
}

export const openApiSchema = getOpenApiSchema(
  false
) as unknown as ChatCompletionCreateParams.Function[];
