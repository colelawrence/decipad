import { type AST, type Value } from '@decipad/language-interfaces';
import { evaluate } from './evaluate';
import { withPush, type TRealm } from '../scopedRealm';

export const functionCallValue = async (
  _realm: TRealm,
  functionBody: AST.Block,
  argNames: string[],
  args: Value.Value[]
): Promise<Value.Value> =>
  withPush(
    _realm,
    async (realm) => {
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
    },
    `function call value`
  );
