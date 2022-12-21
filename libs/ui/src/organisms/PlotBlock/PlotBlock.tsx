import { FC } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import type { ComponentProps } from 'react';
import { CellInput, ErrorMessage } from '../../atoms';
import { PlotParams } from '../PlotParams/PlotParams';
import { PlotResult } from '../PlotResult/PlotResult';
import { Plot as PlotIcon } from '../../icons';

const plotIconSizeStyles = css({
  display: 'grid',
  width: '28px',
  height: '28px',
});

const plotTitleStyles = css({
  // TODO: title styles
  display: 'flex',
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
          placeholder="Plot title"
          variant="heading"
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
