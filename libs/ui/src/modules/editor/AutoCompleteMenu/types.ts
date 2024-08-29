import { SmartRefDecoration } from '@decipad/editor-types';
import { AutocompleteName } from '@decipad/remote-computer';

export type Identifier = AutocompleteName & {
  readonly editing?: boolean;
  readonly focused?: boolean;
  readonly isCell?: boolean;
  readonly decoration?: SmartRefDecoration;
};
