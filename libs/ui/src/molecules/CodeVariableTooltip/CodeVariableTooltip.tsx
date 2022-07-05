import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import type { SerializedType, Result } from '@decipad/computer';
import { Tooltip } from '../../atoms';
import { red600 } from '../../primitives';
import { CodeResult } from '../../organisms';

const highlightStyles = css({
  borderBottom: `1px dotted ${red600.rgb}`,
  color: red600.rgb,
});

interface CodeVariableTooltipProps {
  type: SerializedType;
  value: Result.OneResult;
  children: ReactNode;
}

export const CodeVariableTooltip: FC<CodeVariableTooltipProps> = ({
  type,
  value,
  children,
}): ReturnType<FC> => {
  return (
    <Tooltip trigger={<span css={highlightStyles}>{children}</span>}>
      <CodeResult type={type} value={value} variant="inline" tooltip={false} />
    </Tooltip>
  );
};
