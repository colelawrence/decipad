/* eslint-disable no-param-reassign */
import type { FC } from 'react';
import { useResourceUsage } from '@decipad/react-contexts';
import { useCallback, useEffect, useState } from 'react';
import {
  CodeEditor,
  InputFieldDate,
  p13Regular,
  StatusLine,
  TextAndIconButton,
} from '@decipad/ui';
import { Play } from 'libs/ui/src/icons';
import { assertInstanceOf } from '@decipad/utils';
import styled from '@emotion/styled';
import { DataLakeRunner, varIdentifierRegex } from '@decipad/notebook-tabs';
import type { ConnectionProps } from '../types';
import { SplitPreview } from '../SplitPreview';

const DataLakeConnectionWrapper = styled.div({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  '[role=tabpanel]': {
    display: 'contents',
  },
});

const StyledHeader = styled.header({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: '8px',
});

const TimeSizer = styled.div({
  width: '110px',
  '&[data-latest=true]': {
    width: '75px',
  },
});

const TimeWrapper = styled.div({
  display: 'flex',
  flexDirection: 'row',
  gap: '8px',
  alignItems: 'center',
});

export const DataLakeConnection: FC<ConnectionProps> = (props) => {
  const { runner, onRun } = props;
  assertInstanceOf(runner, DataLakeRunner);

  const { queries } = useResourceUsage();
  const [query, setQuery] = useState(runner.options.runner.query ?? '');

  const [_, setVarIdentifiers] = useState<RegExpMatchArray[]>([]);

  // Date
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    runner.setOptions({ runner: { time: selectedDate?.getTime() } });
  }, [runner, selectedDate]);

  const onDateChange = useCallback((date: Date | null) => {
    setSelectedDate(date);
  }, []);

  return (
    <DataLakeConnectionWrapper>
      <StyledHeader>
        <TextAndIconButton
          text="Run"
          size="fit"
          color="default"
          iconPosition="left"
          disabled={queries.hasReachedLimit}
          onClick={onRun}
        >
          <Play />
        </TextAndIconButton>
        <TimeWrapper>
          <label css={p13Regular}>As seen of</label>
          <TimeSizer data-latest={!selectedDate}>
            <InputFieldDate
              value={selectedDate?.toISOString().split('T')[0]}
              onChange={(dateAsString) => onDateChange(new Date(dateAsString))}
              size="small"
              placeholder="Latest"
            />
          </TimeSizer>
          {selectedDate && (
            <TextAndIconButton
              text="Reset"
              size="fit"
              color="default"
              iconPosition="left"
              onClick={() => {
                setSelectedDate(null);
              }}
            />
          )}
        </TimeWrapper>
      </StyledHeader>
      <SplitPreview conn={props}>
        <CodeEditor
          code={query}
          setCode={(q) => {
            const identifiers = q.matchAll(varIdentifierRegex);
            setVarIdentifiers([...identifiers]);
            runner.setOptions({ runner: { query: q } });
            setQuery(q);
          }}
          lang="sql"
        />
      </SplitPreview>
      <footer>
        <StatusLine type="javascript" logs={props.info} />
      </footer>
    </DataLakeConnectionWrapper>
  );
};
