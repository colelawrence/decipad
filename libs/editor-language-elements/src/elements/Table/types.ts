import type { IdentifiedError } from '@decipad/computer-interfaces';
import type { AST } from '@decipad/language-interfaces';

export interface ColumnParseReturn {
  errors: IdentifiedError[];
  expression?: AST.Expression;
  columnName: string;
  elementId: string;
}
