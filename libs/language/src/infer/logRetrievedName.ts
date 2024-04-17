import type { TScopedInferContext } from '../scopedRealm';

export const logRetrievedName = (
  ctx: TScopedInferContext,
  name: string | readonly [string, string]
) => {
  const nsName = typeof name === 'string' ? (['', name] as const) : name;
  if (ctx.usedNames && ctx.stack.isNameGlobal(nsName)) {
    ctx.addUsedName(nsName);
  }
};
