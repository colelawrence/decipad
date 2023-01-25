import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import type { ComponentProps } from 'react';
import { FC } from 'react';
import { CellInput, ErrorMessage } from '../../atoms';
import { Plot as PlotIcon } from '../../icons';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';

const plotIconSizeStyles = css({
  display: 'grid',
  width: '22px',
  height: '22px',
});

const plotTitleStyles = css({
  // TODO: title styles
  display: 'flex',
  alignItems: 'center',
  gap: 4,
});

const plotBlockStyles = css({
  display: 'grid',
  rowGap: '16px',
});

const plotStyles = css({
  alignSelf: 'center',
});

interface PlotBlockProps {
  readOnly?: boolean;
  errorMessage?: string;
  plotParams: ComponentProps<typeof PlotParams>;
  result?: ComponentProps<typeof PlotResult>;
  title: string;
  onTitleChange?: (newValue: string) => void;
}

export const PlotBlock = ({
  readOnly = false,
  errorMessage,
  plotParams,
  result,
  title,
  onTitleChange = noop,
}: PlotBlockProps): ReturnType<FC> => {
  return (
    <section css={plotBlockStyles} contentEditable={false}>
      <div css={plotTitleStyles}>
        <div css={plotIconSizeStyles}>
          <PlotIcon />
        </div>
        <CellInput
          value={title}
          onChange={onTitleChange}
          placeholder="Chart title"
        />
      </div>
      <>
        {!readOnly && <PlotParams {...plotParams} />}
        {errorMessage && <ErrorMessage message={errorMessage} />}
        {result && (
          <output css={plotStyles}>
            <PlotResult {...result} />
          </output>
        )}
      </>
    </section>
  );
};
