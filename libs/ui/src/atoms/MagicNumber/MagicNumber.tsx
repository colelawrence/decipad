import { Result } from '@decipad/computer';
import { useComputer } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, MouseEvent, ReactNode, useCallback } from 'react';
import { Loading } from '../../icons';
import { CodeResult } from '../../organisms';
import { cssVar } from '../../primitives';
import { Tooltip } from '../Tooltip/Tooltip';

type MagicNumberProps = {
  readonly result?: Result.Result | undefined;
  readonly loadingState?: boolean;
  readOnly?: boolean;
  readonly onClick?: () => void;
  readonly setPointyStyles?: boolean;
  readonly expression?: string;
};

const wrapperStyles = css({
  display: 'inline-flex',
  cursor: 'pointer',
});

const baseCreatorStyles = css({
  color: cssVar('magicNumberTextColor'),
  textDecoration: 'underline',
  textDecorationStyle: 'dashed',
  textDecorationColor: cssVar('magicNumberTextColor'),
  textDecorationThickness: 1,
});

interface ExprRefLinkProps {
  expression: string;
}

const ExprRefLink: FC<ExprRefLinkProps> = ({ expression }) => {
  const computer = useComputer();
  const blockId = computer.getVarBlockId$.use(expression);

  const onClick = useCallback(
    (ev: MouseEvent) => {
      if (typeof blockId === 'string') {
        const el = document.getElementById(blockId);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
        ev.preventDefault();
        ev.stopPropagation();
      }
    },
    [blockId]
  );

  return (
    (blockId && (
      <a href={`#${blockId}`} onClick={onClick}>
        Go to definition &rarr;
      </a>
    )) ||
    null
  );
};

interface ResultResultProps {
  children?: ReactNode;
  readOnly: boolean;
  expression?: string;
}

const IntrospectMagicNumber: FC<ResultResultProps> = ({
  expression,
  readOnly,
  children,
}) => {
  return (
    <Tooltip trigger={<span>{children}</span>}>
      {expression?.startsWith('exprRef_') && !readOnly ? (
        <ExprRefLink expression={expression} />
      ) : readOnly ? (
        `Live Result`
      ) : (
        <span>
          Formula: <pre>{expression}</pre>
        </span>
      )}
    </Tooltip>
  );
};

export const MagicNumber = ({
  result,
  loadingState = false,
  readOnly = false,
  onClick = noop,
  expression,
}: MagicNumberProps): ReturnType<React.FC> => {
  const hasResult = !!result && !loadingState;
  return (
    <span
      onClick={onClick}
      css={[wrapperStyles, !readOnly && baseCreatorStyles]}
    >
      <span
        title={result ? result.value?.toString() : 'Loading'}
        contentEditable={false}
      >
        <IntrospectMagicNumber expression={expression} readOnly={readOnly}>
          {hasResult ? (
            <CodeResult tooltip={false} variant="inline" {...result} />
          ) : (
            <span
              css={css({
                margin: 'auto',
                '> svg': { height: '16px', display: 'block', margin: '0 auto' },
              })}
            >
              <Loading />
            </span>
          )}
        </IntrospectMagicNumber>
      </span>
    </span>
  );
};
