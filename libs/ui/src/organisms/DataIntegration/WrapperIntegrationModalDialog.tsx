import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { cssVar, p15Medium } from '../../primitives';
import { Close } from '../../icons';
import { Button } from '../../atoms';
import { DbOptions } from './DatabaseConnectionScreen';

type Stages = 'pick-source' | 'connect' | 'create-query' | 'map';
interface WrapperIntegrationModalDialogProps {
  children: ReactNode;
  title: string;

  showTabs?: boolean;
  tabStage?: Stages | undefined;
  onTabClick?: (s: Stages) => void;

  onAbort: () => void;

  onConnect: () => void;
  isConnectShown?: boolean;
  isConnectDisabled?: boolean;
  dbOptions?: DbOptions;
}

const buttonTitle = {
  'pick-source': 'Connect',
  connect: 'Connect',
  'create-query': 'Execute Query',
  'execute-query': 'Continue to Preview and Map',
  map: 'Done',
};

const shouldDisableButton = (
  tabStage: string,
  dbOptions: DbOptions
): boolean => {
  const { query, connectionString, host } = dbOptions;
  switch (tabStage) {
    case 'pick-source':
      // TODO: fix this, it should return true if the "import file" field is empty
      return true;
    case 'create-query':
      return !query;
    case 'connect':
      return !connectionString && !host;
    case 'map':
      return false;
    default:
      return true;
  }
};

export const WrapperIntegrationModalDialog: FC<
  WrapperIntegrationModalDialogProps
> = ({
  title,
  isConnectShown = false,
  isConnectDisabled = false,
  onConnect,
  onAbort,
  showTabs = false,
  tabStage = 'pick-source',
  onTabClick = noop,
  children,
  dbOptions,
}) => {
  return (
    <div css={wrapperStyles}>
      <div css={titleWrapperStyles}>
        <div css={titleStyles}>{title}</div>
        {showTabs && (
          <div css={tabStyles}>
            <div
              {...([
                'connect',
                'pick-source',
                'create-query',
                'execute-query',
              ].includes(tabStage) && { 'aria-selected': true })}
              onClick={() => onTabClick('connect')}
            >
              Connection
            </div>
            {dbOptions?.query && (
              <div
                {...(tabStage === 'map' && { 'aria-selected': true })}
                onClick={() => onTabClick('map')}
              >
                Mapping
              </div>
            )}
          </div>
        )}
        <div css={iconStyles}>
          <div role="button" onClick={onAbort}>
            <Close />
          </div>
        </div>
      </div>
      {children}
      <div css={bottomBarStyles}>
        {(!tabStage || ['pick-source', 'connect'].includes(tabStage)) && (
          <div>
            <Button type="secondary" onClick={onAbort}>
              Abort
            </Button>
          </div>
        )}
        <div>
          <Button type="text">Contact Support</Button>
        </div>
        {isConnectShown && (
          <div css={connectStyles}>
            <Button
              type="primaryBrand"
              disabled={
                isConnectDisabled ||
                (dbOptions && shouldDisableButton(tabStage, dbOptions))
              }
              onClick={tabStage !== 'map' ? onConnect : onAbort}
            >
              {tabStage === 'create-query' && !dbOptions?.query
                ? buttonTitle['execute-query']
                : buttonTitle[tabStage]}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const wrapperStyles = css({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '740px',
  height: '600px',
  padding: '32px',
  gap: '12px',

  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '12px',

  backgroundColor: cssVar('backgroundColor'),
});

const tabStyles = css({
  display: 'flex',
  cursor: 'pointer',
  div: {
    padding: '8px 10px',
    borderTopLeftRadius: '6px',
    borderTopRightRadius: '6px',
    borderBottom: `1px solid ${cssVar('strongerHighlightColor')}`,
  },
  'div[aria-selected]': {
    borderWidth: '1px 1px 0px 1px',
    borderStyle: 'solid',
    borderColor: cssVar('strongerHighlightColor'),
  },
});

const titleWrapperStyles = css(p15Medium, {
  color: cssVar('normalTextColor'),
  height: '30px',

  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',
});

const titleStyles = css({
  lineHeight: '30px',
  flexShrink: 0,
  paddingLeft: '5px',
  paddingRight: '15px',
  borderBottom: `1px solid ${cssVar('strongerHighlightColor')}`,
});

const iconStyles = css({
  marginLeft: 'auto',

  height: '30px',
  width: '100%',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  borderBottom: `1px solid ${cssVar('evenStrongerHighlightColor')}`,

  div: {
    width: '16px',
    height: '16px',
  },
});

export const dividerStyles = css({
  width: '100%',
  border: `1px solid ${cssVar('highlightColor')}`,
  borderRadius: '4px',
});

const bottomBarStyles = css({
  marginTop: 'auto',
  width: '100%',

  display: 'flex',
  gap: '20px',
});

const connectStyles = css({
  marginLeft: 'auto',
});
