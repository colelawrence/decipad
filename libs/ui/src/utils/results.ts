import { SerializedType } from '@decipad/computer';

export function isTabularType(type: SerializedType | undefined): boolean {
  return (
    type != null &&
    (type.kind === 'column' || type.kind === 'row' || type.kind === 'table')
  );
}
