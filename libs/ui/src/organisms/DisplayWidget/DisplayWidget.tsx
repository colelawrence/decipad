/* eslint decipad/css-prop-named-variable: 0 */
import type { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import type { IdentifiedError, IdentifiedResult } from '@decipad/computer';
import {
  CodeResult,
  AvailableSwatchColor,
  IconPopover,
  Tooltip,
  UserIconKey,
} from '@decipad/ui';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { Caret } from '../../icons';
import * as icons from '../../icons';
import { cssVar, p14Regular, p24Medium, setCssVar } from '../../primitives';

const wrapperStyles = css({
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  position: 'relative',
});

const triggerStyles = (readOnly: boolean, selected: boolean) =>
  css({
    width: '100%',
    borderRadius: 8,
    padding: '0px 6px 0px 8px',
    fontSize: 24,
    minHeight: 40,
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    marginTop: '4px',
    ...(selected && { backgroundColor: cssVar('highlightColor') }),
    ...(!readOnly && {
      border: `1px solid ${cssVar('borderColor')}`,
      ':hover': {
        backgroundColor: cssVar('highlightColor'),
      },
      cursor: 'pointer',
    }),
  });

const textWrapperStyles = css({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '2px',
});

const iconWrapperStyles = css({
  ...setCssVar('currentTextColor', cssVar('weakTextColor')),
  alignItems: 'center',
  display: 'grid',
  height: `20px`,
  width: '20px',
  mixBlendMode: 'luminosity',
});

const charLimit = css({
  maxWidth: '200px',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
});

interface DisplayWidgetDropdownProps {
  readonly openMenu: boolean;
  readonly onChangeOpen: (arg0: boolean) => void;
  readonly lineResult?: IdentifiedResult | IdentifiedError;
  readonly result?: string;
  readonly readOnly: boolean;
  readonly children: ReactNode;
  readonly icon?: UserIconKey;
  readonly color?: AvailableSwatchColor;
  readonly saveIcon?: (newIcon: UserIconKey) => void;
}

export const DisplayWidget: FC<DisplayWidgetDropdownProps> = ({
  openMenu,
  onChangeOpen,
  lineResult,
  result = 'Result',
  readOnly,
  children,
  icon = 'Paperclip',
  saveIcon = noop,
}) => {
  const Icon = icons[icon];

  const fullVarName = (
    <p
      css={[
        p14Regular,
        charLimit,
        !lineResult?.result && { color: cssVar('weakerTextColor') },
      ]}
    >
      {result}
    </p>
  );

  return (
    <>
      <div css={wrapperStyles}>
        {useIsEditorReadOnly() ? (
          <span css={iconWrapperStyles}>
            <Icon />
          </span>
        ) : (
          <IconPopover
            color={'Malibu'}
            trigger={
              <div css={iconWrapperStyles}>
                <Icon />
              </div>
            }
            onChangeIcon={saveIcon}
          />
        )}
        <div css={textWrapperStyles}>
          <Tooltip trigger={fullVarName}>{result}</Tooltip>
        </div>
      </div>
      {children}
      <div
        css={triggerStyles(readOnly, openMenu)}
        onClick={() => !readOnly && onChangeOpen(!openMenu)}
        data-testid="result-widget"
      >
        <span css={[p24Medium, { color: cssVar('strongTextColor') }]}>
          {lineResult?.result?.type.kind !== 'type-error' &&
          lineResult?.result ? (
            <CodeResult {...lineResult.result} />
          ) : (
            '0'
          )}
        </span>
        {!readOnly && (
          <div css={{ width: 20, height: 20 }}>
            <Caret variant={openMenu ? 'up' : 'down'} color="normal" />
          </div>
        )}
      </div>
    </>
  );
};
