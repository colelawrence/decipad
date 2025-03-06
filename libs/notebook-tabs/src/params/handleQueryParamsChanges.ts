import { IdentifiedBlock } from '@decipad/computer-interfaces';
import { parseBlockOrThrow } from '@decipad/computer';

import { intervals, lastPeriods } from './types';
import { AST } from '@decipad/language-interfaces';
import { format, isValid } from 'date-fns';
import { getPeriodComparison } from './getPeriodComparison';
import { dequal } from '@decipad/utils';

// Add this type at the top
type BeforeReplaceEvent = CustomEvent<{
  history?: History;
  state?: unknown;
  unused?: unknown;
  url: string;
}>;

export const handleQueryParamsChanges = (
  onChange: (queryBlocks: IdentifiedBlock[]) => void
  // TODO: Add manual query params for server side
) => {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const previousBlocks = new Map<string, IdentifiedBlock>();

  const updateBlocksOnURLparamsChange = (customEvent: {
    detail?: {
      history?: History;
      state?: unknown;
      unused?: unknown;
      url: string;
    };
  }) => {
    const searchParams = new URLSearchParams(
      customEvent?.detail?.url?.split('?')[1] || window.location.search
    );
    const startDate = searchParams.get('FilterStartDate');
    const interval = searchParams.get('FilterInterval');
    const lastPeriod = searchParams.get('FilterLastPeriod');

    const blocks = createQueryBlocks(startDate, interval, lastPeriod);
    if (blocks == null) {
      return;
    }

    const changedBlocks = blocks.filter((block) => {
      const existingBlock = previousBlocks.get(block.id);

      return existingBlock == null || !dequal(existingBlock, block);
    });

    for (const block of changedBlocks) {
      previousBlocks.set(block.id, block);
    }

    if (changedBlocks.length > 0) onChange(blocks);
  };

  updateBlocksOnURLparamsChange({ detail: { url: window.location.search } });

  // Update the event listener
  window.addEventListener('beforereplace', ((e: BeforeReplaceEvent) =>
    updateBlocksOnURLparamsChange(e)) as EventListener);

  return () => {
    // And the removal
    window.removeEventListener('beforereplace', ((e: BeforeReplaceEvent) =>
      updateBlocksOnURLparamsChange(e)) as EventListener);
  };
};

function createQueryBlocks(
  startDate: string | null,
  interval: string | null,
  lastPeriod: string | null
) {
  if (!startDate || !interval || !lastPeriod) return;

  if (!isValid(new Date(startDate))) {
    console.error('Invalid start date', startDate);
    return;
  }

  // Validate interval
  const intervalEnum = intervals.find(
    (i) => i.toLowerCase() === interval.toLowerCase()
  );
  if (!intervalEnum) {
    console.error('Invalid interval', interval);
    return;
  }

  // Validate last period
  const lastPeriodEnum = lastPeriods.find(
    (i) => i.toLowerCase() === lastPeriod.toLowerCase()
  );
  if (!lastPeriodEnum) {
    console.error('Invalid last period', lastPeriod);
    return;
  }

  const { beginStartDate, endDate, compareStartDate, compareEndDate } =
    getPeriodComparison(new Date(startDate), intervalEnum, lastPeriodEnum);

  const blocks: IdentifiedBlock[] = Object.entries({
    // Date range
    FilterStartDate: () => `round(date(${startDate}), ${intervalEnum})`,
    FilterBeginStartDate: beginStartDate,
    FilterEndDate: endDate,
    FilterCompareStartDate: compareStartDate,
    FilterCompareEndDate: compareEndDate,
    // Interval
    FilterInterval: interval,
    // Last period
    FilterLastPeriod: lastPeriod,
  }).map(([key, value]) => {
    let block: AST.Block | undefined;

    if (value instanceof Date) {
      block = parseBlockOrThrow(
        `${key} = date(${format(value, 'yyyy-MM-dd HH:mm')})`
      );
    } else if (typeof value === 'string') {
      block = parseBlockOrThrow(`${key} = "${value}"`);
    } else if (typeof value === 'function') {
      block = parseBlockOrThrow(`${key} = ${value()}`);
    } else {
      block = parseBlockOrThrow(`${key} = ${value}`);
    }

    block.id = key;

    return {
      type: 'identified-block',
      id: key,
      block,
      definesVariable: key,
    };
  });

  return blocks;
}
