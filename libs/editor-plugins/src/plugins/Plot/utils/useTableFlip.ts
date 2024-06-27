import { PlotElement, markTypesThatCanFlip } from '@decipad/editor-types';
import { SerializedType } from '@decipad/language-interfaces';
import { PlainObject } from 'libs/ui/src/modules/editor/PlotResult/PlotResult.types';
import { useCallback, useEffect, useState } from 'react';
import { AllowedPlotValue } from './plotUtils.interface';
import { transposeTable } from './transposeTable';

export interface FlipStatus {
  ok: boolean;
  reason: string;
}

export interface FlipResult {
  flipStatus: FlipStatus;
  flippedData: PlainObject;
  flippedColumnNames: string[];
  flippedColumnTypes: SerializedType[];
}

export const useTableFlip = (
  element: PlotElement,
  data: PlainObject | undefined
): FlipResult => {
  const isFlipped = element.flipTable;

  const [flipStatus, setFlipStatus] = useState<FlipStatus>({
    ok: true,
    reason: '',
  });
  const [flippedData, setFlippedData] = useState<PlainObject>({ table: [] });
  const [flippedColumnNames, setFlippedColumnNames] = useState<string[]>([]);
  const [flippedColumnTypes, setFlippedColumnTypes] = useState<
    SerializedType[]
  >([]);

  const doFlipTable = useCallback(
    (table: Array<Record<string, AllowedPlotValue>>) => {
      if (!isFlipped) {
        setFlipStatus({ ok: true, reason: '' });
      }

      const flipResult = transposeTable(table);
      if (flipResult.ok) {
        const { data: dataResult, columnNames, columnTypes } = flipResult;
        setFlipStatus({ ok: true, reason: '' });
        setFlippedData({ table: dataResult });
        setFlippedColumnNames(columnNames);
        setFlippedColumnTypes(columnTypes);
      }
      if (flipResult.ok === false) {
        setFlipStatus({ ok: false, reason: flipResult.reason });
        console.error(flipResult.reason);
      }
    },
    [isFlipped]
  );

  useEffect(() => {
    if (
      isFlipped &&
      data &&
      data.table &&
      data.table.length > 0 &&
      markTypesThatCanFlip.includes(element.markType)
    ) {
      doFlipTable(data.table);
    }
    if (!isFlipped) {
      setFlippedData({ table: [] });
      setFlippedColumnNames([]);
      setFlippedColumnTypes([]);
    }
  }, [data, doFlipTable, element.markType, isFlipped]);

  return { flipStatus, flippedData, flippedColumnNames, flippedColumnTypes };
};
