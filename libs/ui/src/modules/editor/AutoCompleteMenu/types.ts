import { SmartRefDecoration } from '@decipad/editor-types';
import { ACItemType } from '../AutoCompleteMenuItem/AutoCompleteMenuItem';

export type Identifier = {
  readonly kind: 'variable' | 'function' | 'column';
  readonly identifier: string;
  readonly blockId?: string;
  readonly columnId?: string;
  readonly type: ACItemType;
  readonly inTable?: string;
  readonly editing?: boolean;
  readonly focused?: boolean;
  readonly explanation?: string;
  readonly syntax?: string;
  readonly example?: string;
  readonly formulaGroup?: string;
  readonly isCell?: boolean;
  readonly decoration?: SmartRefDecoration;
};
