import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren } from 'react';
import { Tag } from '../../atoms';
import * as icons from '../../icons';
import { cssVar, p16Bold } from '../../primitives';
import { blockAlignment } from '../../styles';
import { slimBlockWidth } from '../../styles/editor-layout';

const editableLiveCaptionStyles = css({
  maxWidth: `${slimBlockWidth}px`,
});

const tableTitleWrapper = css({
  alignItems: 'center',
  display: 'flex',
  gap: '9px',
  padding: `${blockAlignment.editorTable.paddingTop} 0 12px 0`,
  lineBreak: 'unset',
});

const iconWrapperStyles = css({
  backgroundColor: cssVar('liveDataBackgroundColor'),
  padding: '4px',
  borderRadius: '4px',
  height: '20px',
  width: '20px',
  marginTop: '0',
  'svg > path': {
    fill: cssVar('normalTextColor'),
  },
});

const inlineArrowStyles = css({
  fontWeight: 'bolder',
  bottom: '4px',
});

const arrowStyles = css(inlineArrowStyles, {
  fontSize: '6px',
  position: 'absolute',
});

const editableTableCaptionStyles = css(p16Bold);
type EditableTableCaptionProps = PropsWithChildren<{
  empty?: boolean;
  source?: string;
  url?: string;
}>;

export const EditableLiveDataCaption: FC<EditableTableCaptionProps> = ({
  empty = false,
  source,
  url,
  children,
}) => {
  const [caption] = Children.toArray(children);
  return (
    <div css={editableLiveCaptionStyles}>
      <div css={tableTitleWrapper}>
        <div css={iconWrapperStyles} contentEditable={false}>
          <icons.Bolt />
        </div>
        <div
          aria-placeholder={empty ? 'LiveConnection' : ''}
          css={[editableTableCaptionStyles]}
        >
          {caption}
        </div>
        {source && (
          <Tag
            explanation={
              url && (
                <a href={url} rel="noreferrer" target="_blank">
                  {url} <span css={inlineArrowStyles}>↗</span>
                </a>
              )
            }
          >
            {source} <span css={arrowStyles}>↗</span>
          </Tag>
        )}
      </div>
    </div>
  );
};
