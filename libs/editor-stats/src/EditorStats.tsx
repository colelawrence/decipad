import { FC, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { StatsPopup } from '@decipad/ui';
import { useEditorStats } from '@decipad/react-contexts';

const EditorStats: FC = () => {
  const stats = useEditorStats();

  const computerRequestStatSamples = useMemo(
    () => stats.computerRequestStatSamples.map((s, i) => ({ ...s, _id: i })),
    [stats.computerRequestStatSamples]
  );
  const computerExpressionResultStatSamples = useMemo(
    () =>
      stats.computerExpressionResultStatSamples.map((s, i) => ({
        ...s,
        _id: i,
      })),
    [stats.computerExpressionResultStatSamples]
  );
  const dataViewStatSamples = useMemo(
    () => stats.dataViewsStatsSamples.map((s, i) => ({ ...s, _id: i })),
    [stats.dataViewsStatsSamples]
  );
  return createPortal(
    <StatsPopup
      {...stats}
      computerRequestStatSamples={computerRequestStatSamples}
      computerExpressionResultStatSamples={computerExpressionResultStatSamples}
      dataViewsStatsSamples={dataViewStatSamples}
    />,
    document.body
  );
};

export default EditorStats;
