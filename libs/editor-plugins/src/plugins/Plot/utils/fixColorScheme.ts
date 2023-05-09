import { clone, get, set } from 'lodash';
import { PlotSpec } from './plotUtils.interface';

const colorSchemePaths = [
  'config.encoding.color.scheme',
  'encoding.color.scale.scheme',
];

export const fixColorScheme = <T extends PlotSpec | undefined>(
  _spec: T,
  isDarkMode: boolean
): T => {
  if (_spec == null) {
    return _spec;
  }
  const spec = clone(_spec);
  const suffix = `_${isDarkMode ? 'dark' : 'light'}`;
  for (const path of colorSchemePaths) {
    const value = get(spec, path);
    if (typeof value === 'string' && !value.endsWith(suffix)) {
      set(spec, path, value + suffix);
    }
  }
  return spec;
};
