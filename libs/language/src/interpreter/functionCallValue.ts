// eslint-disable-next-line no-restricted-imports
import { type AST, type Value } from '@decipad/language-types';
import { type TRealm } from './types';
import { evaluate } from './evaluate';

export const functionCallValue = async (
  realm: TRealm,
  functionBody: AST.Block,
  argNames: string[],
  args: Value.Value[]
): Promise<Value.Value> => {
  return realm.scopedToDepth(0, async () => {
    return realm.withPush(async () => {
      for (let i = 0; i < args.length; i++) {
        const argName = argNames[i];

        realm.stack.set(argName, args[i]);
      }

      for (let i = 0; i < functionBody.args.length; i++) {
        // eslint-disable-next-line no-await-in-loop
        const value = await evaluate(realm, functionBody.args[i]);

        if (i === functionBody.args.length - 1) {
          return value;
        }
      }

      throw new Error('function is empty');
    });
  });
};
