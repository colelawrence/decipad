import { safeNumberForPrecision } from '@decipad/computer';
import DeciNumber from '@decipad/number';
import { useComputer } from '@decipad/react-contexts';

/**
 * We take the results from the computer
 * Do some restrictions on the type that can go through
 * And then we have an array of JS objects.
 */
export function useDeciVariables(): { [key: string]: string } {
  const computer = useComputer();
  return computer.results$.useWithSelector((resObject) => {
    return Object.fromEntries(
      Object.values(resObject.blockResults)
        .map((r) => {
          if (r.type === 'identified-error') {
            return undefined;
          }

          switch (r.result.type.kind) {
            case 'string':
            case 'boolean': {
              const varName = computer.getSymbolDefinedInBlock(r.id);
              if (!varName) return undefined;
              return [varName, r.result.value?.valueOf()] as const;
            }
            case 'number': {
              const varName = computer.getSymbolDefinedInBlock(r.id);
              if (!varName) return undefined;
              const resVal = r.result.value as DeciNumber;
              if (!resVal) return undefined;
              const [, valOf] = safeNumberForPrecision(resVal);
              return [varName, valOf] as const;
            }
          }
          return undefined;
        })
        .reduce((map, current) => {
          if (!current) return map;
          map.set(current[0], current[1]);
          return map;
        }, new Map<string, any>())
        .entries()
    );
  });
}
