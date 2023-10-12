import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import {
  ComputerStat,
  ComputerExpressionResultStat,
} from '@decipad/remote-computer';

export interface DataViewStat {
  computeLayoutElapsedTimeMs: number;
}

export type EditorStatsStore = {
  // computer
  computerRequestStatSamples: ComputerStat[];
  computeRequestTimeMax?: number;
  computeRequestTimeMin?: number;
  computeRequestTimeAverage?: number;
  computeRequestTimeLast?: number;
  pushComputerRequestStat(stats: ComputerStat): void;

  computerExpressionResultStatSamples: ComputerExpressionResultStat[];
  pushComputerExpressionResultStat(stats: ComputerExpressionResultStat): void;

  // data-views
  dataViewsStatsSamples: DataViewStat[];
  pushDataViewStat(stats: DataViewStat): void;
};

type StatsStoreSetter = (stats: EditorStatsStore) => Partial<EditorStatsStore>;

const MAX_SAMPLE_RETENTION = 100;

const average = (numbers: number[]) => {
  if (average.length < 1) {
    return undefined;
  }
  let sum = 0;
  for (const n of numbers) {
    sum += n;
  }
  return sum / numbers.length;
};

const createComputerStats = (
  set: (fn: StatsStoreSetter) => void
): EditorStatsStore => ({
  // Computer stats
  computerRequestStatSamples: [],
  pushComputerRequestStat: (stats) => {
    const { fullRequestElapsedTimeMs = 0 } = stats;
    set((state) => {
      const samples = state.computerRequestStatSamples.concat(stats);
      return {
        ...state,
        computeRequestTimeLast: Math.round(fullRequestElapsedTimeMs),
        computerRequestStatSamples: samples.slice(
          state.computerRequestStatSamples.length >= MAX_SAMPLE_RETENTION
            ? 1
            : 0
        ),
        computeRequestTimeMax: Math.round(
          Math.max(
            fullRequestElapsedTimeMs,
            state.computeRequestTimeMax ?? -Infinity
          )
        ),
        computeRequestTimeMin: Math.round(
          Math.min(
            fullRequestElapsedTimeMs,
            state.computeRequestTimeMin ?? Infinity
          )
        ),
        computeRequestTimeAverage: Math.round(
          average(
            samples.map((sample) => sample.fullRequestElapsedTimeMs ?? 0)
          ) ?? 0
        ),
      };
    });
  },

  computerExpressionResultStatSamples: [],
  pushComputerExpressionResultStat: (stats) => {
    set((state) => {
      const samples = state.computerExpressionResultStatSamples.concat(stats);
      return {
        ...state,
        computerExpressionResultStatSamples: samples.slice(
          state.computerExpressionResultStatSamples.length >=
            MAX_SAMPLE_RETENTION
            ? 1
            : 0
        ),
      };
    });
  },

  // Data view stats
  dataViewsStatsSamples: [],
  pushDataViewStat: (stats) => {
    set((state) => {
      const samples = state.dataViewsStatsSamples.concat(stats);
      return {
        ...state,
        dataViewsStatsSamples: samples.slice(
          state.dataViewsStatsSamples.length >= MAX_SAMPLE_RETENTION ? 1 : 0
        ),
      };
    });
  },
});

export const editorStatsStore = createStore<EditorStatsStore>((set) => ({
  ...createComputerStats(set),
}));

export const useEditorStats = () => useStore(editorStatsStore);
