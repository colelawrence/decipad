import type { CellProps } from './types';
import { usePipedCellPluginOption } from './usePipedCellPluginOption';
import { useComputer } from '@decipad/editor-hooks';
import { useRenderReadonlyCellEditor } from './useRenderReadonlyCellEditor';
import { useParseCellText } from './useParseCellText';

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

  const computer = useComputer();

  const deserializedValue = useParseCellText(computer, transformedValue);

  const renderedValue = useRenderReadonlyCellEditor(deserializedValue);
  const renderedValueWithAbove = useRenderAboveReadOnly(renderedValue, props);

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
      {renderedValueWithAbove}
    </div>
  );
};
