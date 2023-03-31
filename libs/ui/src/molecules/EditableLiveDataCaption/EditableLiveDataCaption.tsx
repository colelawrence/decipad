import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, ReactNode } from 'react';
import { useSelected } from 'slate-react';
import { Tag } from '../../atoms';
import {
  cssVar,
  normalOpacity,
  offBlack,
  p13Medium,
  setCssVar,
  transparency,
} from '../../primitives';
import { slimBlockWidth } from '../../styles/editor-layout';
import { Zap } from '../../icons';

const editableLiveCaptionStyles = css({
  maxWidth: `${slimBlockWidth}px`,
  marginBottom: '8px',
});

const tableTitleWrapper = css({
  alignItems: 'center',
  display: 'flex',
  gap: '9px',
  lineBreak: 'unset',
  width: 'min-content',
  background: cssVar('liveDataBackgroundColor'),
  borderRadius: '6px',
  padding: '2px 8px',
  marginTop: '2.5px',
});

const iconWrapperStyles = css({
  padding: '4px',
  height: '16px',
  width: '16px',
  marginTop: '0',
  transform: 'translateY(-7%)',
});

const iconSvgStyles = css({
  'svg > path': {
    fill: cssVar('liveDataBackgroundColor'),
    stroke: cssVar('liveDataTextColor'),
  },
});

const editableTableCaptionStyles = css({
  ...p13Medium,
  color: cssVar('liveDataTextColor'),
  minWidth: '1rem',
});

const notSelectedAriaStyles = css({
  '::before': {
    ...setCssVar('currentTextColor', cssVar('weakTextColor')),
    content: 'attr(aria-placeholder)',
  },
});

type EditableTableCaptionProps = PropsWithChildren<{
  empty?: boolean;
  source?: string;
  range?: string;
  url?: string;
  icon?: ReactNode;
}>;

export const EditableLiveDataCaption: FC<EditableTableCaptionProps> = ({
  empty = false,
  source,
  url,
  range,
  children,
  icon,
}) => {
  const [caption] = Children.toArray(children);
  const selected = useSelected();

  return (
    <div css={editableLiveCaptionStyles}>
      <div css={tableTitleWrapper}>
        <div css={[iconWrapperStyles, iconSvgStyles]} contentEditable={false}>
          {icon ?? <Zap />}
        </div>
        <div
          aria-placeholder={empty ? 'LiveConnection' : ''}
          css={[editableTableCaptionStyles, !selected && notSelectedAriaStyles]}
        >
          {caption}
        </div>
        {source && (
          <Tag
            explanation={
              url && (
                <a href={url} rel="noreferrer" target="_blank">
                  {url}
                  <br />
                  <br />
                  {source.trim()}
                </a>
              )
            }
          >
            <span
              css={css({
                textTransform: 'uppercase',
                color: `${transparency(offBlack, normalOpacity).rgba}`,
              })}
            >
              {range !== '' ? `${range}` : 'LIVE'}
            </span>
          </Tag>
        )}
      </div>
    </div>
  );
};
