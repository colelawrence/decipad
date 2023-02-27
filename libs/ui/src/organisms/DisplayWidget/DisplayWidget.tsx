import { IdentifiedError, IdentifiedResult } from '@decipad/computer';
import { CodeResult } from '@decipad/ui';
import { css } from '@emotion/react';
import { FC, ReactNode } from 'react';
import { ArrowOutlined, Caret } from '../../icons';
import { cssVar, p14Regular, p32Medium } from '../../primitives';
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
    padding: '0px 6px 0px 8px',
    fontSize: 24,
    minHeight: 44,
    height: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    transition: 'all 0.2s ease-in-out',
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

const iconStyles = css({
  display: 'grid',
  justifyContent: 'center',
  alignItems: 'center',
  '> svg': {
    height: 24,
    width: 24,
  },
});

interface DropdownWidgetOptions {
  type: 'var' | 'calc';
  id: string;
  text: string;
  explanation?: string;
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
  return (
    <>
      <div css={wrapperStyles}>
        <div css={iconStyles}>
          <ArrowOutlined />
        </div>
        <div css={textWrapperStyles}>
          <span css={[p14Regular, { color: cssVar('weakTextColor') }]}>
            {`Result: ${result ?? 'Name'}`}
          </span>
        </div>
      </div>
      {children}
      <div
        css={triggerStyles(readOnly, openMenu)}
        onClick={() => !readOnly && onChangeOpen(!openMenu)}
        data-testid="result-widget"
      >
        <span
          css={[
            p32Medium,
            !lineResult?.result && { color: cssVar('weakerTextColor') },
          ]}
        >
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
      {openMenu && !readOnly && (
        <AutoCompleteMenu
          top={false}
          result={result}
          identifiers={dropdownContent.map<Identifier>((item) => ({
            kind: 'variable',
            identifier: item.text,
            explanation: item.explanation,
            type: item.id,
          }))}
          onExecuteItem={(i) => {
            setSelectedId(i.type);
          }}
        />
      )}
    </>
  );
};
