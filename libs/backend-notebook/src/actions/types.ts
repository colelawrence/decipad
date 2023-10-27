import { PromiseOrType } from '@decipad/utils';
import { BackendNotebook } from '../types';
import { MyEditor } from '@decipad/editor-types';

export type NotebookActionHandler<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TRet = unknown
> = (editor: MyEditor, params: TParams) => PromiseOrType<TRet>;

export type NotebooklessActionHandler<
  TParams extends Record<string, unknown> = Record<string, unknown>,
  TRet = unknown
> = (params: TParams) => PromiseOrType<TRet>;

export type ActionParams<
  TActionName extends keyof BackendNotebook,
  TAction extends BackendNotebook[TActionName] = BackendNotebook[TActionName]
> = Parameters<TAction>[0];

export type ActionResult<
  TActionName extends keyof BackendNotebook,
  TAction extends BackendNotebook[TActionName] = BackendNotebook[TActionName]
> = ReturnType<TAction>;

export type ActionName = keyof BackendNotebook;

type ResponseCode = '200';

// eslint-disable-next-line no-use-before-define
type Schema = InlineSchema | RefSchema;

interface InlineSchema {
  type: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
  description?: string;
}

interface RefSchema {
  $ref: string;
}

interface VoidResponseSpec {
  description: string;
}

interface SchemaResponseSpec {
  description: string;
  schemaName: string;
  schema?: Schema;
}

type ResponseSpec = VoidResponseSpec | SchemaResponseSpec;

interface Parameter {
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description: string;
  required: boolean;
  schema: Schema;
}

interface RequestBody {
  schema: Schema;
}

export interface BaseAction<k extends ActionName> {
  summary: string;
  description?: string;
  responses: Record<ResponseCode, ResponseSpec>;
  parameters: Parameter[];
  requestBody?: RequestBody;
  validateParams: (
    params: Record<string, unknown>
  ) => params is ActionParams<k>;
}

export interface RequiresNotebookAction<k extends ActionName>
  extends BaseAction<k> {
  requiresNotebook: true;
  handler: NotebookActionHandler<ActionParams<k>, ActionResult<k>>;
}

export interface NoNotebookAction<k extends ActionName> extends BaseAction<k> {
  requiresNotebook: false;
  handler: NotebooklessActionHandler<ActionParams<k>, ActionResult<k>>;
}

export type Action<k extends ActionName> =
  | NoNotebookAction<k>
  | RequiresNotebookAction<k>;

export type Actions = {
  [k in ActionName]: Action<k>;
};
