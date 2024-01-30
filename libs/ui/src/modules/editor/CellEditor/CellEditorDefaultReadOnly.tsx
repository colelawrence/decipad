/* eslint decipad/css-prop-named-variable: 0 */
import type { CellProps } from './types';
import { usePipedCellPluginOption } from './usePipedCellPluginOption';

export const CellEditorDefaultReadOnly = (props: CellProps) => {
  const { value, plugins } = props;

  const useTextAlign = usePipedCellPluginOption(plugins, 'useTextAlign');
  const useTransformValue = usePipedCellPluginOption(
    plugins,
    'useTransformValue'
  );
  const useRenderAboveReadOnly = usePipedCellPluginOption(
    plugins,
    'useRenderAboveReadOnly'
  );

  const transformedValue = useTransformValue(value, props);
  const textAlign = useTextAlign('left', props);
  const renderedValue = useRenderAboveReadOnly(transformedValue, props);

  return (
    <div
      css={{
        textAlign,
        // Prevent visible selection when interacting with pointer
        '::selection': {
          backgroundColor: 'transparent',
        },
      }}
    >
      {renderedValue}
    </div>
  );
};
