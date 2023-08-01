import type { EditorStatsStore } from '@decipad/react-contexts';
import { useWindowListener } from '@decipad/react-utils';
import { css } from '@emotion/react';
import { FC, useState } from 'react';
import { cssVar, h1, h2, smallShadow } from '../../primitives';
import { ComputerStats } from './ComputerStats';
import { DataViewStats } from './DataViewStats';

const styles = css({
  position: 'fixed',
  zIndex: '9999',
  display: 'flex',
  right: 0,
  bottom: 0,
  height: '100vh',
  flexDirection: 'column',
  width: '500px',

  borderRadius: ' 16px 0 0 16px',
  padding: '24px',
  boxShadow: `0 0 16px 0 ${smallShadow.rgba}`,

  background: cssVar('backgroundMain'),
  overflowY: 'scroll',
});

const statsStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',

  margin: '16px 0 24px 0',
});

export const StatsPopup: FC<EditorStatsStore> = ({
  computerRequestStatSamples,
  computerExpressionResultStatSamples,
  computeRequestTimeMax,
  computeRequestTimeMin,
  computeRequestTimeAverage,
  computeRequestTimeLast,
  dataViewsStatsSamples,
}) => {
  const [show, setShow] = useState<boolean>(false);
  useWindowListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key?.toLowerCase() === 's'
      ) {
        setShow((prevShow) => !prevShow);
      }
    },
    true
  );

  return show ? (
    <div css={styles}>
      <h2 css={h1}>Stats</h2>
      <h3 css={h2}>Computer</h3>
      <ComputerStats
        computerRequestStatSamples={computerRequestStatSamples}
        computerExpressionResultStatSamples={
          computerExpressionResultStatSamples
        }
      />
      <div css={statsStyles}>
        <table>
          <tbody>
            <tr>
              <th>max:</th>
              <td>{computeRequestTimeMax}</td>
              <th>min:</th>
              <td>{computeRequestTimeMin}</td>
              <th>avg:</th>
              <td>{computeRequestTimeAverage}</td>
              <th>last:</th>
              <td>{computeRequestTimeLast}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 css={h2}>Data views</h3>
      <DataViewStats stats={dataViewsStatsSamples} />
    </div>
  ) : null;
};
