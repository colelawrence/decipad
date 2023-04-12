import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import { noop } from '@decipad/utils';
import { cssVar, p15Medium } from '../../primitives';
import { Close } from '../../icons';
import { Button } from '../../atoms';

type Stages = 'connect' | 'create-query' | 'map';
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
}

export const WrapperIntegrationModalDialog: FC<
  WrapperIntegrationModalDialogProps
> = ({
  title,
  isConnectShown = false,
  isConnectDisabled = false,
  onConnect,
  onAbort,
  showTabs = false,
  tabStage = undefined,
  onTabClick = noop,
  children,
}) => {
  return (
    <div css={wrapperStyles}>
      <div css={titleStyles}>
        <span>{title}</span>
        {showTabs && (
          <div css={tabStyles}>
            <div
              {...(tabStage === 'connect' && { 'aria-selected': true })}
              onClick={() => onTabClick('connect')}
            >
              Connection
            </div>
            <div
              {...(tabStage === 'create-query' && { 'aria-selected': true })}
              onClick={() => onTabClick('create-query')}
            >
              Query
            </div>

            <div
              {...(tabStage === 'map' && { 'aria-selected': true })}
              onClick={() => onTabClick('map')}
            >
              Mapping
            </div>
          </div>
        )}
        <div css={iconStyles}>
          <div>
            <Close />
          </div>
        </div>
      </div>
      {children}
      <div css={bottomBarStyles}>
        <div>
          <Button type="primary" onClick={onAbort}>
            Abort
          </Button>
        </div>
        <div>
          <Button type="text">Contact Support</Button>
        </div>
        {isConnectShown && (
          <div css={connectStyles}>
            <Button
              type="primaryBrand"
              disabled={isConnectDisabled}
              onClick={onConnect}
            >
              Connect
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

const titleStyles = css(p15Medium, {
  color: cssVar('normalTextColor'),
  height: '30px',

  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'end',

  span: {
    lineHeight: '30px',
    verticalAlign: 'center',
    flexShrink: 0,
    flexBasis: '120px',
    borderBottom: `1px solid ${cssVar('strongerHighlightColor')}`,
  },
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
