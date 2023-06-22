import { css } from '@emotion/react';
import { List } from '../../icons';
import { cssVar, p13Medium, setCssVar } from '../../primitives';

export interface ColumnDndPreviewProps {
  readonly label: string;
}

export const ColumnDndPreview: React.FC<ColumnDndPreviewProps> = ({
  label,
}) => {
  return (
    <div css={columnHeaderDndStyles}>
      <span css={grabIconListStyle}>
        <List />
      </span>
      <span>{label}</span>
    </div>
  );
};

const columnHeaderDndStyles = css(p13Medium, {
  backgroundColor: cssVar('droplineBgColor'),
  //  opacity: 0.95,
  borderRadius: 8,
  transform: 'rotate(-3deg)',
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  padding: '8px 12px',
  gap: 12,
});

const grabIconListStyle = css({
  display: 'inline-block',
  verticalAlign: 'text-top',
  height: 16,
  width: 16,
  svg: {
    ...setCssVar('currentTextColor', cssVar('droplineColor')),
    ...setCssVar('strongTextColor', cssVar('droplineColor')),
    ...setCssVar('iconBackgroundColor', cssVar('droplineBgColor')),
  },
});
