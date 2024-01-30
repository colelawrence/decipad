import { useMemo } from 'react';
import type { CellPlugin, PipeableCellPluginOptions } from './types';

export const usePipedCellPluginOption = <
  K extends PipeableCellPluginOptions,
  F extends Exclude<CellPlugin[K], undefined>
>(
  plugins: CellPlugin[],
  key: K
): F =>
  useMemo(
    () =>
      (...args: any) => {
        const [initialValue, ...restArgs] = args;

        return plugins.reduce((value, plugin) => {
          const pluginOption = plugin[key];

          if (pluginOption) {
            return (pluginOption as any)(value, ...restArgs);
          }

          return value;
        }, initialValue);
      },
    [plugins, key]
  ) as F;
