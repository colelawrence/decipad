import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { formatResultPreview } from '@decipad/format';
import { IdentifiedError, IdentifiedResult } from '@decipad/computer';
import {
  grey200,
  grey300,
  grey400,
  grey500,
  p14Regular,
  p32Medium,
} from '../../primitives';
import { ArrowOutlined } from '../../icons';
import {
  AutoCompleteMenu,
  Identifier,
} from '../AutoCompleteMenu/AutoCompleteMenu';

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
    padding: 8,
    fontSize: 24,
    minHeight: 44,
    height: '100%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
    ...(selected && { backgroundColor: grey200.rgb }),
    ...(!readOnly && { border: `1px solid ${grey300.rgb}` }),
    ':hover': {
      backgroundColor: grey200.rgb,
    },
  });

const iconStyles = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: 24,
  width: 24,
});

interface DropdownWidgetOptions {
  type: 'var' | 'calc';
  id: string;
  text: string;
}

interface DisplayWidgetDropdownProps {
  readonly dropdownContent: Array<DropdownWidgetOptions>;
  readonly openMenu: boolean;
  readonly onChangeOpen: (arg0: boolean) => void;
  readonly selectedId: string;
  readonly setSelectedId: (arg0: string) => void;
  readonly lineResult?: IdentifiedResult | IdentifiedError;
  readonly result: string | null;
  readonly readOnly: boolean;
  readonly children: ReactNode;
}

export const DisplayWidget: FC<DisplayWidgetDropdownProps> = ({
  dropdownContent,
  openMenu,
  onChangeOpen,
  setSelectedId,
  lineResult,
  result,
  readOnly,
  children,
}) => {
  if (readOnly) {
    return <div css={triggerStyles(readOnly, false)}>{children}</div>;
  }

  return (
    <>
      <div css={wrapperStyles}>
        <div css={iconStyles}>
          <ArrowOutlined />
        </div>
        <span css={[p14Regular, { color: grey500.rgb }]}>
          {`Result: ${result ?? 'Name'}`}
        </span>
        {!result && (
          <span css={[p14Regular, { color: grey400.rgb }]}>
            (pick from the list)
          </span>
        )}
      </div>
      {children}
      <div
        css={triggerStyles(readOnly, openMenu)}
        onClick={() => onChangeOpen(!openMenu)}
        data-testid="result-widget"
      >
        {lineResult?.result && (
          <span css={p32Medium}>{formatResultPreview(lineResult.result)}</span>
        )}
      </div>
      {openMenu && (
        <AutoCompleteMenu
          top={false}
          rounded={true}
          identifiers={dropdownContent.map<Identifier>((item) => ({
            kind: 'variable',
            identifier: item.text,
            type: item.id,
          }))}
          onExecuteItem={(i) => {
            setSelectedId(i.type);
            onChangeOpen(false);
          }}
        />
      )}
    </>
  );
};
