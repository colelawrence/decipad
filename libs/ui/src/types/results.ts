import { Result, SerializedType, SerializedTypeKind } from '@decipad/language';

export interface CodeResultProps<T extends SerializedTypeKind>
  extends Result<T> {
  readonly parentType?: SerializedType;
  readonly variant?: 'block' | 'inline';
}
