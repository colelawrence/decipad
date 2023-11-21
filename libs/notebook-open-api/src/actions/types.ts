import { PromiseOrType } from '@decipad/utils';
import { NotebookOpenApi } from '../types';
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
  TActionName extends keyof NotebookOpenApi,
  TAction extends NotebookOpenApi[TActionName] = NotebookOpenApi[TActionName]
> = Parameters<TAction>[0];

export type ActionResult<
  TActionName extends keyof NotebookOpenApi,
  TAction extends NotebookOpenApi[TActionName] = NotebookOpenApi[TActionName]
> = ReturnType<TAction>;

export type ActionName = keyof NotebookOpenApi;

// eslint-disable-next-line no-use-before-define
type Schema = InlineSchema | RefSchema;

interface InlineSchema {
  type: string;
  properties?: Record<string, Schema>;
  required?: string[];
  enum?: string[];
  items?: Schema;
  description?: string;
}

interface RefSchema {
  $ref: string;
}

type SchemaResponseSpec =
  | {
      schemaName: string;
    }
  | {
      schema: Schema;
    };

type ResponseSpec = SchemaResponseSpec;

interface Parameter {
  description: string;
  required: boolean;
  schema: Schema;
}

export interface BaseAction<k extends ActionName> {
  summary: string;
  description?: string;
  response?: ResponseSpec;
  parameters: Record<string, Parameter>;
  validateParams: (
    params: Record<string, unknown>
  ) => params is ActionParams<k>;
}

export interface RequiresNotebookAction<k extends ActionName>
  extends BaseAction<k> {
  requiresNotebook: true;
  returnsActionResultWithNotebookError?: boolean;
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

export interface BaseCustomAction<Params extends Record<string, unknown>> {
  summary: string;
  description?: string;
  response?: ResponseSpec;
  parameters: Record<string, Parameter>;
  validateParams: (params: Record<string, unknown>) => params is Params;
}

export interface RequiresNotebookCustomAction<
  CustomActionParams extends Record<string, unknown>,
  CustomActionResult
> extends BaseCustomAction<CustomActionParams> {
  requiresNotebook: true;
  returnsActionResultWithNotebookError?: boolean;
  handler: NotebookActionHandler<CustomActionParams, CustomActionResult>;
}

export interface NoNotebookCustomAction<
  CustomActionParams extends Record<string, unknown>,
  CustomActionResult
> extends BaseCustomAction<CustomActionParams> {
  requiresNotebook: false;
  handler: NotebooklessActionHandler<CustomActionParams, CustomActionResult>;
}

export type CustomAction<
  Args extends Record<string, unknown> = Record<string, unknown>,
  Ret = unknown
> = NoNotebookCustomAction<Args, Ret> | RequiresNotebookCustomAction<Args, Ret>;
