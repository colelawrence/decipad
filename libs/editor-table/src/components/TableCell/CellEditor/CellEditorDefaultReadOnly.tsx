import { isText } from '@udecode/plate-common';
import { useMemo } from 'react';
import { parseCellText } from './serializeCellText';
import type { CellProps } from './types';
import { usePipedCellPluginOption } from './usePipedCellPluginOption';
import { SmartRef } from '@decipad/ui';
import { useComputer } from '@decipad/react-contexts';

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

  const deserializedValue = useMemo(
    () => parseCellText(computer, transformedValue),
    [transformedValue, computer]
  );

  const renderedValue = useMemo(
    () =>
      deserializedValue.map((part, index) => {
        if (isText(part)) {
          return part.text;
        }

        const { blockId } = part;

        return (
          <SmartRef
            key={index}
            symbolName={computer.getSymbolDefinedInBlock(blockId)}
            defBlockId={blockId}
          />
        );
      }),
    [deserializedValue, computer]
  );

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
