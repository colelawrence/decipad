/* eslint decipad/css-prop-named-variable: 0 */
import { UserIconKey } from '@decipad/editor-types';
import { css } from '@emotion/react';
import { hideOnPrint } from 'libs/ui/src/styles/editor-layout';
import { AvailableSwatchColor } from 'libs/ui/src/utils';
import { FC, ReactNode } from 'react';
import * as userIcons from '../../../icons/user-icons';
import {
  cssVar,
  getThemeColor,
  p12Medium,
  placeholderOpacity,
} from '../../../primitives';
import { Height, codeBlock } from '../../../styles';

const tableControlStyles = css(p12Medium, hideOnPrint, {
  // Shifts whole div to the right.
  marginLeft: 'auto',
  display: 'flex',
  alignItems: 'center',
  cursor: 'pointer',
  gap: '6px',
  color: cssVar('textDefault'),
  height: Height.Bubble,
});

const tableCaptionInnerStyles = css({
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  gap: '9px',
  lineBreak: 'unset',

  gridColumn: '3 / span 1',
});

const tableIconSizeStyles = css({
  position: 'relative',
  top: -1,
  left: -1,
  flexShrink: 0,
  display: 'grid',
  width: 16,
  height: 16,
});

const tableVarStyles = css(codeBlock.structuredVariableStyles, {
  height: '100%',
  padding: '0px 6px',
  borderRadius: '6px',
  display: 'flex',
  alignItems: 'center',
  overflowWrap: 'anywhere',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  '@media print': {
    background: 'unset',
  },
});

const tableTitleWrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: '2px',
});

const placeholderStyles = css({
  cursor: 'text',
  display: 'flex',
  '&::after': {
    pointerEvents: 'none',
    opacity: placeholderOpacity,
  },
});

type TableToolbarProps = {
  readonly color?: AvailableSwatchColor;
  readonly icon: UserIconKey;
  readonly readOnly: boolean;
  readonly empty?: boolean;
  readonly emptyLabel?: string;
  readonly caption: ReactNode;
  readonly iconPopover?: ReactNode;
  readonly actions: ReactNode;

  readonly gridColumn?: string;
};

export const TableToolbar: FC<TableToolbarProps> = ({
  readOnly,
  empty,
  emptyLabel,
  actions,
  iconPopover,
  caption = 'test',
  icon = 'TableSmall',
  color = 'Perfume',
}) => {
  const IconComponent = userIcons[icon] ?? userIcons.TableSmall;

  return (
    <div css={tableCaptionInnerStyles}>
      <div
        css={[
          tableTitleWrapperStyles,
          tableVarStyles,
          {
            backgroundColor: color
              ? getThemeColor(color).Background.Subdued
              : cssVar('themeBackgroundSubdued'),
            mixBlendMode: 'luminosity',
          },
        ]}
      >
        <div
          contentEditable={false}
          css={[
            tableIconSizeStyles,
            {
              mixBlendMode: 'luminosity',
            },
          ]}
        >
          {readOnly || !iconPopover ? <IconComponent /> : iconPopover}
        </div>
        <div
          role="textbox"
          aria-roledescription="table name"
          css={[
            placeholderStyles,
            empty && {
              '::after': {
                content: `"${emptyLabel ?? 'Table name...'}"`,
              },
            },
            {
              color: color
                ? getThemeColor(color).Text.Default
                : cssVar('themeTextDefault'),
            },
          ]}
          spellCheck={false}
          contentEditable={!readOnly}
          data-testid={'table-name-input'}
        >
          {caption}
        </div>
      </div>
      <div css={[tableControlStyles, hideOnPrint]} contentEditable={false}>
        {actions}
      </div>
    </div>
  );
};
