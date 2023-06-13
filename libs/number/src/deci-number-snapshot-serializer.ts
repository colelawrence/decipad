import { once } from '@decipad/utils';

export const setupDeciNumberSnapshotSerializer = once(() => {
  // TODO: we need to bypass this because this serializer is not working in CI (reason unknown)
  // expect.addSnapshotSerializer({
  //   test: (v: unknown) => v instanceof DeciNumber,
  //   print: (f: unknown) => `DeciNumber(${f?.toString()})`,
  // });
});
