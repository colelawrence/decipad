import { SerializedType } from '@decipad/language';

export function isTabularType(type: SerializedType | undefined): boolean {
  return type != null && (type.kind === 'column' || type.kind === 'table');
}
