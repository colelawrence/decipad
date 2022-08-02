import { FC, ReactNode } from 'react';
import { css } from '@emotion/react';
import type { SerializedType, Result } from '@decipad/computer';
import { noop } from '@decipad/utils';
import { Tooltip } from '../../atoms';
import { p8Regular } from '../../primitives';
import { CodeResult } from '../../organisms';

const goToDefStyles = css(p8Regular);

interface CodeVariableTooltipProps {
  type: SerializedType;
  value: Result.OneResult;
  children: ReactNode;
  defBlockId?: string | null;
  provideDefinitionLink: boolean;
  onGoToDefinition?: () => void;
}

export const CodeVariableTooltip: FC<CodeVariableTooltipProps> = ({
  type,
  value,
  children,
  defBlockId,
  provideDefinitionLink,
  onGoToDefinition = noop,
}): ReturnType<FC> => {
  return (
    <Tooltip trigger={<span>{children}</span>}>
      <CodeResult type={type} value={value} variant="inline" tooltip={false} />
      {provideDefinitionLink && defBlockId && (
        <a
          css={goToDefStyles}
          href={`#${defBlockId}`}
          onClick={onGoToDefinition}
        >
          Go to definition &rarr;
        </a>
      )}
    </Tooltip>
  );
};
