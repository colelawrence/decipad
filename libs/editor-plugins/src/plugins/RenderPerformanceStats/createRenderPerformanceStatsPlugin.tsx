import { createPluginFactory, PlatePluginComponent } from '@udecode/plate';
import { ComponentProps, FC } from 'react';

type ComponentKey = string;
interface ComponentStats {
  totalTimeMs: number;
  maxTimeMs: number;
  totalRenderCount: number;
}

const stats = new Map<ComponentKey, ComponentStats>();

const pushStats = (key: ComponentKey, elapsed: number) => {
  let stat: ComponentStats | undefined = stats.get(key);
  if (!stat) {
    stat = {
      totalTimeMs: 0,
      maxTimeMs: 0,
      totalRenderCount: 0,
    };
    stats.set(key, stat);
  }
  stat.totalRenderCount += 1;
  stat.totalTimeMs += elapsed;
  if (elapsed > stat.maxTimeMs) {
    stat.maxTimeMs = elapsed;
  }
  stat.totalRenderCount += 1;
};

const showStats = () => {
  const table = [...stats.entries()].map(([key, stat]) => ({
    key,
    totalRenderCount: stat.totalRenderCount,
    totalTimeμs: Math.round(stat.totalTimeMs * 1000),
    averageRenderTimeμs: Math.round(
      (stat.totalTimeMs * 1000) / stat.totalRenderCount
    ),
    maxRenderTimeμs: stat.maxTimeMs * 1000,
  }));
  // eslint-disable-next-line no-console
  console.table(table, [
    'key',
    'totalRenderCount',
    'totalTimeμs',
    'averageRenderTimeμs',
    'maxRenderTimeμs',
  ]);
  stats.clear();
};

interface Deci {
  showStats: () => void;
}
interface WithDeci {
  deci: Deci;
}

(global as unknown as WithDeci).deci = {
  showStats,
};

export const createRenderPerformanceStatsPlugin = createPluginFactory({
  key: 'PLUGIN_RENDER_PERFORMANCE_STATS',
  withOverrides: (editor) => {
    if (process.env.NODE_ENV === 'production') {
      return editor;
    }
    const performanceWrapper =
      <T extends PlatePluginComponent>(
        key: string,
        Component: T
      ): FC<ComponentProps<T>> =>
      (props: ComponentProps<T>) => {
        const t1 = performance.now();
        const c = <Component {...props} />;
        const t2 = performance.now();
        pushStats(key, t2 - t1);
        return c;
      };

    editor.plugins
      .filter((plugin) => plugin.isElement)
      .forEach((plugin) => {
        const { component } = plugin;
        if (component) {
          // eslint-disable-next-line no-param-reassign
          plugin.component = performanceWrapper(plugin.key, component);
        }
      });
    return editor;
  },
});
