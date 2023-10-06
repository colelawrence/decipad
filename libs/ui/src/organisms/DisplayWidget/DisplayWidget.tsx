/* eslint decipad/css-prop-named-variable: 0 */
import type { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import type { IdentifiedError, IdentifiedResult } from '@decipad/computer';
import { useIsEditorReadOnly } from '@decipad/react-contexts';
import {
  CodeResult,
  AvailableSwatchColor,
  IconPopover,
  Tooltip,
  DropdownMenu,
  SelectItems,
} from '@decipad/ui';
import { noop } from '@decipad/utils';
import { Caret } from '../../icons';
import * as icons from '../../icons';
import { cssVar, p14Regular, p24Medium } from '../../primitives';
import { ResultFormatting } from '../../types';
import { UserIconKey } from '@decipad/editor-types';

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
    ...(selected && { backgroundColor: cssVar('backgroundDefault') }),
    ...(!readOnly && {
      border: `1px solid ${cssVar('borderSubdued')}`,
      ':hover': {
        backgroundColor: cssVar('backgroundDefault'),
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
  readonly formatting?: ResultFormatting;
  readonly result?: string;
  readonly readOnly: boolean;
  readonly children: ReactNode;
  readonly icon?: UserIconKey;
  readonly color?: AvailableSwatchColor;
  readonly saveIcon?: (newIcon: UserIconKey) => void;
  readonly saveColor?: (newColor: AvailableSwatchColor) => void;
  readonly onExecute?: (option: SelectItems) => void;
  readonly allResults: SelectItems[];
}

export const DisplayWidget: FC<DisplayWidgetDropdownProps> = ({
  openMenu,
  onChangeOpen,
  lineResult,
  formatting = 'automatic',
  result = 'Result',
  readOnly,
  children,
  color = 'Sun',
  icon = 'Crown',
  saveIcon = noop,
  saveColor = noop,
  onExecute = noop,
  allResults,
}) => {
  const Icon = icons[icon];

  const fullVarName = (
    <p
      css={[
        p14Regular,
        charLimit,
        !lineResult?.result && { color: cssVar('textDisabled') },
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
            color={color}
            trigger={
              <div css={iconWrapperStyles}>
                <Icon />
              </div>
            }
            onChangeIcon={saveIcon}
            onChangeColor={saveColor}
          />
        )}

        <div css={textWrapperStyles}>
          <Tooltip trigger={fullVarName}>{result}</Tooltip>
        </div>
      </div>
      {children}
      <DropdownMenu
        open={openMenu}
        setOpen={!readOnly ? onChangeOpen : noop}
        onExecute={onExecute}
        groups={allResults}
        isReadOnly={readOnly}
      >
        <div
          css={triggerStyles(readOnly, openMenu)}
          onClick={() => !readOnly && onChangeOpen(!openMenu)}
          data-testid="result-widget"
        >
          <span css={[p24Medium, { color: cssVar('textHeavy') }]}>
            {lineResult?.result?.type.kind !== 'type-error' &&
            lineResult?.result ? (
              <CodeResult {...lineResult.result} formatting={formatting} />
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
      </DropdownMenu>
    </>
  );
};
