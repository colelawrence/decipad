import { slimBlockWidth } from 'libs/ui/src/styles/editor-layout';
import styled from '@emotion/styled';
import { useState, useCallback } from 'react';

import { cssVar } from '@decipad/ui';
import { ListFilterIcon } from 'lucide-react';
import { TimePeriod, FiltersButton, FiltersButtonGroup } from './TimePeriod';
import { useHasBlock } from '@decipad/editor-hooks';
import { useTabNavigate } from '@decipad/frontend/src/notebooks/notebook/hooks/useTabNavigate';
import { Bullet } from 'libs/ui/src/icons/Bullet';
import { notebooks } from '@decipad/routing';
import {
  DEFAULT_INTERVAL,
  DEFAULT_LAST_PERIOD,
  Interval,
  LastPeriod,
  intervals,
  lastPeriods,
} from '@decipad/notebook-tabs';
import { useRouteParams } from 'typesafe-routes/react-router';
import { isValid } from 'date-fns';

export const GlobalFilters = ({ ...props }: {}) => {
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const query = useRouteParams(notebooks({}).notebook);

  const { navigateTo } = useTabNavigate(false);

  const handleOnChange = useCallback(
    ({
      startDate,
      interval,
      lastPeriod,
    }: {
      startDate: Date | null;
      interval: Interval;
      lastPeriod: LastPeriod;
    }) => {
      const newParams = {
        FilterStartDate: startDate?.toISOString().split('T')[0],
        FilterInterval: interval,
        FilterLastPeriod: lastPeriod,
      };

      if (
        newParams.FilterStartDate &&
        // Only navigate if any filter values have changed
        (query.FilterStartDate !== newParams.FilterStartDate ||
          query.FilterInterval !== newParams.FilterInterval ||
          query.FilterLastPeriod !== newParams.FilterLastPeriod)
      ) {
        navigateTo(newParams);
      }
    },
    [query, navigateTo]
  );

  const handleFilterToggle = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  const hasBlock = useHasBlock('integration-block');

  // Hide filters if there is no integration block
  if (!hasBlock) return null;

  // Validate start date. If not found or invalid, use today's date.
  const startDate = (
    query.FilterStartDate && isValid(new Date(query.FilterStartDate))
      ? new Date(query.FilterStartDate)
      : new Date()
  )
    .toISOString()
    .split('T')[0];

  // Validate interval and last period. If not found, use default.
  const intervalEnum = intervals.find(
    (i) => i.toLowerCase() === query.FilterInterval?.toLowerCase()
  );
  const lastPeriodEnum = lastPeriods.find(
    (i) => i.toLowerCase() === query.FilterLastPeriod?.toLowerCase()
  );

  const interval = intervalEnum ?? DEFAULT_INTERVAL;
  const lastPeriod = lastPeriodEnum ?? DEFAULT_LAST_PERIOD;

  return (
    <EditorContainer {...props}>
      <FiltersContainer>
        <TimePeriod
          startDate={startDate}
          interval={interval}
          lastPeriod={lastPeriod}
          onChange={handleOnChange}
          style={{
            transform: isFiltersOpen ? 'translateX(0)' : 'translateX(10px)',
            opacity: isFiltersOpen ? 1 : 0,
            visibility: isFiltersOpen ? 'visible' : 'hidden',
            transition:
              'transform 0.2s ease, opacity 0.2s ease, visibility 0.2s ease',
          }}
        />

        <FiltersButtonGroup>
          <FiltersButton onClick={handleFilterToggle}>
            <NotificationBullet isFiltersOpen={isFiltersOpen} />
            <ListFilterIcon size={16} />
          </FiltersButton>
        </FiltersButtonGroup>
      </FiltersContainer>
    </EditorContainer>
  );
};

const EditorContainer = styled.div({
  position: 'relative',
  zIndex: 11,
  width: slimBlockWidth,
  margin: '0 auto',
  marginTop: '-28px',
});

const FiltersContainer = styled(FiltersButtonGroup)`
  display: flex;
  width: 100%;
  justify-content: end;
  gap: 12px;
`;

const NotificationBullet = styled(Bullet, {
  shouldForwardProp: (prop) => prop !== 'isFiltersOpen',
})<{ isFiltersOpen: boolean }>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${cssVar('stateDangerBackground')};
  transition: opacity 0.2s ease;
  opacity: ${({ isFiltersOpen }) => (isFiltersOpen ? 0 : 1)};
`;
