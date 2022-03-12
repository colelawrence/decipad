import { css } from '@emotion/react';
import type { ComponentProps } from 'react';
import { FC } from 'react';
import { ErrorMessage } from '../../atoms';
import { cssVar } from '../../primitives';
import { blockAlignment } from '../../styles';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';

const plotBlockStyles = css({
  margin: `${blockAlignment.plot.paddingTop} 0`,
  border: `1px solid ${cssVar('strongHighlightColor')}`,
  borderRadius: '12px',
  padding: '6px 12px',

  display: 'grid',
  rowGap: '8px',
});

const plotStyles = css({
  alignSelf: 'center',
});

interface PlotBlockProps {
  readOnly?: boolean;
  errorMessage?: string;
  plotParams: ComponentProps<typeof PlotParams>;
  result?: ComponentProps<typeof PlotResult>;
}

export const PlotBlock = ({
  readOnly = false,
  errorMessage,
  plotParams,
  result,
}: PlotBlockProps): ReturnType<FC> => {
  return (
    <section css={plotBlockStyles}>
      {!readOnly && <PlotParams {...plotParams} />}
      {errorMessage && <ErrorMessage message={errorMessage} />}
      {result && (
        <output css={plotStyles}>
          <PlotResult {...result} />
        </output>
      )}
    </section>
  );
};
