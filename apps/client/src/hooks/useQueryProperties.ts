import { useRouter } from 'next/router';

// all-or-nothing string properties from the nextJS router
// The type of the return depends on the argument, which makes the
// object this returns able to be passed with {...props}
export const useQueryProperties = <Prop extends string>(
  props: Prop[]
): Record<Prop, string> | null => {
  const { query } = useRouter();

  const ret: Record<string, string> = {};

  for (const prop of props) {
    const fromNextJS = query[prop];
    if (typeof fromNextJS === 'string' && fromNextJS !== '') {
      ret[prop] = fromNextJS;
    } else {
      return null;
    }
  }

  return ret;
};
