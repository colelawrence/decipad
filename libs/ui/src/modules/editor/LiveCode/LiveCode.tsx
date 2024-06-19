import { css } from '@emotion/react';
import { ReactNode, useMemo } from 'react';
import { Loading, Tooltip } from '../../../shared/atoms';
import {
  Bolt,
  Calendar,
  CheckboxSelected,
  Number,
  TableSmall,
  Text,
  Warning,
} from '../../../icons';
import { cssVar, p10Medium } from '../../../primitives';
import { codeBlock } from '../../../styles';
import { CodeError } from '../CodeError/CodeError';

type Meta = {
  readonly label: string;
  readonly value: string;
};

type LiveCodeProps = {
  readonly children?: ReactNode;
  readonly error?: Error;
  readonly text?: string;
  readonly type?: Kind;
  readonly meta: Meta[];
};

type Kind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'function'
  | 'column'
  | 'materialized-column'
  | 'table'
  | 'materialized-table'
  | 'row'
  | 'tree'
  | 'date'
  | 'range'
  | 'pending'
  | 'nothing'
  | 'anything'
  | 'type-error';

const getIconForType = (type?: Kind): ReactNode => {
  switch (type) {
    case 'number':
      return <Number />;
    case 'boolean':
      return <CheckboxSelected />;
    case 'string':
      return <Text />;
    case 'date':
      return <Calendar />;
    case 'materialized-column':
    case 'materialized-table':
    case 'column':
    case 'table':
      return <TableSmall />;
    case 'type-error':
      return <Warning />;
    case 'pending':
      return <Loading />;
    default:
      return <Bolt />;
  }
};

export const LiveCode = ({
  children,
  text,
  type,
  error,
  meta,
}: LiveCodeProps) => {
  const trigg = useMemo(
    // eslint-disable-next-line decipad/css-prop-named-variable
    () => <span css={{ cursor: 'pointer' }}>{getIconForType(type)}</span>,
    [type]
  );
  const nonErrorTooltip = (
    <Tooltip hoverOnly trigger={trigg}>
      <p>Live code</p>
      {meta.map((m, i) => (
        <p css={metaStyles} key={`meta-live-code-${i}`}>
          {m.label}:<br />
          {m.value}
        </p>
      ))}
    </Tooltip>
  );

  return (
    <div css={liveCodeWrapperStyles} data-testid="live-code">
      <div css={liveInputStyles}>{children}</div>
      <div css={labelStyles} contentEditable={false}>
        <span css={liveIconStyles}>
          {error ? <CodeError message={error.message} /> : nonErrorTooltip}
        </span>
        <span css={liveSpanStyles}>{text || 'LIVE CODE'}</span>
      </div>
    </div>
  );
};

const liveCodeWrapperStyles = css(codeBlock.structuredVariableStyles, {
  display: 'flex',
  gap: 2,
  backgroundColor: cssVar('backgroundDefault'),
  padding: '2px 2px 2px 6px',
  width: 'fit-content',
  marginBottom: 8,
  borderRadius: 6,
  margin: 'auto 0',
  maxHeight: 28,
  overflowWrap: 'anywhere',
  maxWidth: '375px',
  wordBreak: 'break-word',
  whiteSpace: 'normal',
  '@media print': {
    background: 'unset',
  },
});

const liveInputStyles = css({
  display: 'flex',
  padding: '0px 4px',
  alignItems: 'center',
  color: cssVar('textDefault'),
});
const labelStyles = css(p10Medium, {
  display: 'flex',
  borderRadius: 4,
  alignItems: 'center',
  padding: 4,
  cursor: 'default',
  gap: 4,
  backgroundColor: cssVar('themeBackgroundDefault'),
  color: cssVar('themeTextDefault'),
});

const liveIconStyles = css({
  mixBlendMode: 'luminosity',
  svg: {
    height: 16,
    width: 16,
  },
});

const liveSpanStyles = css({
  paddingRight: 2,
  textTransform: 'uppercase',
  whiteSpace: 'nowrap',
});

const metaStyles = css({
  maxWidth: 150,
});
