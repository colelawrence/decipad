import { ZodOpenApiRequestBodyObject, createDocument } from 'zod-openapi';
import { SchemaObject } from 'zod-openapi/lib-types/openapi3-ts/dist/oas30';
import { Action, actions } from './actions';
import { NotebookOpenApi } from './types';

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

const definedActions = Object.entries(actions).filter(
  ([, func]) => func != null
);

export function getOpenApiSchema(): Array<SchemaObject> {
  return definedActions.map(([name, func]) => ({
    name,
    description: func.summary,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parameters: getSchema(func as Action<any>),
  }));
}
