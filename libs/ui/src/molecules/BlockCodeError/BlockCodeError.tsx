import { ClientEventsContext } from '@decipad/client-events';
import { InferError } from '@decipad/remote-computer';
import { AnyElement } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { FC, useContext, useEffect } from 'react';
import {
  componentCssVars,
  p16Regular,
  smallScreenQuery,
} from '../../primitives';
import { slimBlockWidth } from '../../styles/editor-layout';
import { CodeResultProps } from '../../types';

type BlockCodeErrorProps = CodeResultProps<'type-error'> & {
  element?: AnyElement;
};

export const BlockCodeError: FC<BlockCodeErrorProps> = ({ type, element }) => {
  const computer = useComputer();
  const { url } = new InferError(type.errorCause);
  const message = computer.formatError(type.errorCause);
  const clientEvent = useContext(ClientEventsContext);

  useEffect(() => {
    clientEvent({
      type: 'action',
      action: 'user code error',
      props: {
        errorType: type.errorCause.errType,
        elementType: element?.type,
        message,
        url,
      },
    });
  }, [clientEvent, element?.type, message, type.errorCause.errType, url]);

  return (
    <div css={errorBlockBgStyles} contentEditable={false}>
      <div css={errorBlockWrapperStyles}>
        <div css={errorBlockRowStyles}>
          <span css={errorMessageStypes}>{message}</span>
        </div>
      </div>
    </div>
  );
};

const centeredFlex = css({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
});

const errorBlock = css(centeredFlex, {
  padding: '16px 24px 16px 24px',
  gap: 8,
  borderRadius: 8,
  width: slimBlockWidth,
  marginBottom: 8,
  [smallScreenQuery]: {
    minWidth: '360px',
    maxWidth: slimBlockWidth,
    width: '100%',
  },
});

const errorBlockWrapperStyles = css(centeredFlex, {
  flexDirection: 'column',
  gap: 12,
});

const errorMessageStypes = css(p16Regular, {
  color: componentCssVars('ErrorBlockColor'),
});

const errorBlockRowStyles = css(centeredFlex, {
  flexDirection: 'row',
  gap: 8,
});

const errorBlockBgStyles = css(
  { backgroundColor: componentCssVars('ErrorBlockError') },
  errorBlock
);
