/* eslint decipad/css-prop-named-variable: 0 */
import { isFlagEnabled } from '@decipad/feature-flags';
import { generateVarName } from '@decipad/utils';
import { css } from '@emotion/react';
import { Children, FC, PropsWithChildren, ReactNode } from 'react';
import { useSelected } from 'slate-react';
import { Spinner, Tag } from '../../atoms';
import { Data, Zap } from '../../icons';
import {
  normalOpacity,
  offBlack,
  p13Medium,
  transparency,
  yellow400,
  yellow800,
} from '../../primitives';
import { slimBlockWidth } from '../../styles/editor-layout';

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
  background: yellow400.hex,
  borderRadius: '6px',
  padding: '2px 8px',
  marginTop: '2px',
});

const iconWrapperStylesUiIntegration = css({
  height: '16px',
  width: '16px',
  marginTop: '0',
});

const iconWrapperStyles = css({
  padding: '4px',
  height: '16px',
  width: '16px',
  marginTop: '0',
  transform: 'translateY(-7%)',
});

const editableTableCaptionStyles = css({
  ...p13Medium,
  color: yellow800.hex,
  minWidth: '1rem',
});

const notSelectedAriaStyles = css({
  '::before': {
    content: 'attr(aria-placeholder)',
  },
});

type EditableTableCaptionProps = PropsWithChildren<{
  empty?: boolean;
  source?: string;
  range?: string;
  url?: string;
  icon?: ReactNode;
  isUiIntegration?: boolean;
  loading?: boolean;
}>;

export const EditableLiveDataCaption: FC<EditableTableCaptionProps> = ({
  empty = false,
  source,
  url,
  range,
  children,
  icon,
  isUiIntegration = false,
  loading = true,
}) => {
  const [caption] = Children.toArray(children);
  const selected = useSelected();

  return (
    <div css={editableLiveCaptionStyles}>
      <div css={tableTitleWrapper}>
        <div
          css={[
            isUiIntegration
              ? iconWrapperStylesUiIntegration
              : iconWrapperStyles,
          ]}
          contentEditable={false}
        >
          {icon ??
            (loading ? <Spinner /> : isUiIntegration ? <Data /> : <Zap />)}
        </div>
        <div
          aria-placeholder={
            empty ? generateVarName(isFlagEnabled('SILLY_NAMES')) : ''
          }
          css={[editableTableCaptionStyles, !selected && notSelectedAriaStyles]}
        >
          {caption}
        </div>
        {!isUiIntegration && source && (
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
