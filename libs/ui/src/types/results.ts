import { Result, SerializedType, SerializedTypeKind } from '@decipad/computer';

export interface CodeResultProps<T extends SerializedTypeKind>
  extends Result.Result<T> {
  readonly parentType?: SerializedType;
  readonly variant?: 'block' | 'inline';
}
