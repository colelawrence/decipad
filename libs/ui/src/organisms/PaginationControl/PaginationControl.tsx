import { css } from '@emotion/react';
import { FC, PropsWithChildren, useCallback } from 'react';
import { Button, VoidBlock } from '../../atoms';
import { LeftArrow, RightArrow } from '../../icons';
import { PositiveIntegerInput } from '../../molecules';
import { cssVar } from '../../primitives';

const paginationControlOuterWrapperStyles = css({
  display: 'flex',
});

const paginationControlWrapperStyles = css({
  flexGrow: 0,
  display: 'flex',
  flexDirection: 'row',
  border: `1px solid ${cssVar('strongerHighlightColor')}`,
  borderRadius: '6px',
  overflow: 'hidden',
  height: '25px',
  width: 'auto',
});

const iconWrapperStyles = css({
  width: '16px',
  height: '16px',
});

const inputWrapperStyles = css({
  flexGrow: 0,
  borderLeft: `1px solid ${cssVar('strongerHighlightColor')}`,
  borderRight: `1px solid ${cssVar('strongerHighlightColor')}`,
});

const leftButtonWrapperStyles = css({
  flexGrow: 0,
});

const rightButtonWrapperStyles = css({
  flexGrow: 0,
});

const childrenWrapperStyles = css({
  lineHeight: '25px',
  marginLeft: '8px',
});

interface PaginationControlProps {
  page: number;
  startAt: number;
  maxPages: number;
  onPageChange: (page: number) => void;
}
export const PaginationControl: FC<
  PropsWithChildren<PaginationControlProps>
> = ({ page, startAt, maxPages, onPageChange, children }) => {
  return (
    <div css={paginationControlOuterWrapperStyles}>
      <div css={paginationControlWrapperStyles}>
        <div css={leftButtonWrapperStyles}>
          <VoidBlock>
            <Button
              type="minimal"
              size="extraExtraSlim"
              disabled={page <= startAt}
              onClick={useCallback(
                () => onPageChange(page - 1),
                [onPageChange, page]
              )}
            >
              <span css={iconWrapperStyles}>
                <LeftArrow title={`Go to page ${page - 1}`} />
              </span>
            </Button>
          </VoidBlock>
        </div>
        <div css={inputWrapperStyles}>
          <PositiveIntegerInput
            value={page}
            onChange={onPageChange}
            min={startAt}
            max={maxPages}
          />
        </div>
        <div css={rightButtonWrapperStyles}>
          <VoidBlock>
            <Button
              type="minimal"
              size="extraExtraSlim"
              disabled={page >= maxPages}
              onClick={useCallback(
                () => onPageChange(page + 1),
                [onPageChange, page]
              )}
            >
              <span css={iconWrapperStyles}>
                <RightArrow />
              </span>
            </Button>
          </VoidBlock>
        </div>
      </div>
      <div css={childrenWrapperStyles}>{children}</div>
    </div>
  );
};
