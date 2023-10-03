import { once } from '@decipad/utils';
import stringify from 'json-stringify-safe';
import { JSONPatchISOFormat, create, formatters } from 'jsondiffpatch';
import md5 from 'md5';

export const diff = once(() => {
  const differ = create({
    propertyFilter: (name: string) => !name.startsWith('_'),
    objectHash: (obj: Record<string, unknown>) =>
      'id' in obj
        ? obj.id
        : 'text' in obj
        ? md5(stringify(obj), { asString: true })
        : undefined,
    arrays: {
      detectMove: true,
    },
  });

  return (left: unknown, right: unknown): JSONPatchISOFormat => {
    const ops = differ.diff(left, right);
    if (ops) {
      const formatted = formatters.jsonpatch.format(ops, left);
      return formatted;
    }
    return [];
  };
});
