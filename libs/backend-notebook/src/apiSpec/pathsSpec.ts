import type {
  ZodOpenApiPathsObject,
  ZodOpenApiPathItemObject,
  ZodOpenApiOperationObject,
  ZodOpenApiRequestBodyObject,
  ZodOpenApiResponseObject,
  ZodOpenApiMediaTypeObject,
} from 'zod-openapi';
import { getDefined } from '@decipad/utils';
import { actions } from '../actions';

type AnyAction = NonNullable<typeof actions[keyof typeof actions]>;

const notebookIdParameter = (): NonNullable<
  ZodOpenApiPathItemObject['parameters']
>[number] => ({
  name: 'notebookId',
  in: 'query',
  description: 'the notebook id',
  required: true,
  schema: {
    type: 'string',
  },
});

const requestBodySpec = (action: AnyAction): ZodOpenApiRequestBodyObject => ({
  content: {
    'application/json': {
      schema: action.parameterSchema(),
    },
  },
});

const responseSchema = (
  action: AnyAction
): ZodOpenApiMediaTypeObject['schema'] | undefined =>
  action.requiresNotebook &&
  action.returnsActionResultWithNotebookError &&
  action.response
    ? {
        type: 'object',
        properties: {
          result: action.response,
          notebookErrors: {
            type: 'array',
          },
        },
      }
    : action.response;

const responseSpec = (action: AnyAction): ZodOpenApiResponseObject => ({
  description: 'Ok',
  content: {
    'application/json': {
      schema: responseSchema(action),
    },
  },
});

const operationSpec = (
  actionName: string,
  action: AnyAction
): ZodOpenApiOperationObject => ({
  summary: action.summary,
  description: action.description || action.summary,
  operationId: actionName,
  parameters: action.requiresNotebook ? [notebookIdParameter()] : [],
  requestBody: requestBodySpec(action),
  responses: {
    '200': responseSpec(action),
  },
});

const pathSpec = ([actionName, _action]: [string, AnyAction]): [
  string,
  ZodOpenApiPathItemObject
] => {
  const action = getDefined(_action);
  const actionSpec: ZodOpenApiPathItemObject = {
    post: operationSpec(actionName, action),
  };
  return [`/api/notebook/${actionName}`, actionSpec];
};

export const pathsSpec = (): ZodOpenApiPathsObject =>
  Object.fromEntries(Object.entries(actions).map(pathSpec));
