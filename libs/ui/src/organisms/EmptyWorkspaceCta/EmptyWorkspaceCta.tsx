import { css } from '@emotion/react';
import { FC } from 'react';
import { Button } from '../../atoms';

import { computerScreen } from '../../images';
import { cssVar, h1, p14Regular, setCssVar } from '../../primitives';
import { noop } from '../../utils';

const styles = css({
  display: 'grid',
  gridTemplateRows: `
    [banner] 68px
    24px
    [heading] auto
    16px
    [text] auto
    20px
    [button] auto
  `,
  justifyItems: 'center',
  alignContent: 'center',
});

interface EmptyWorkspaceCtaProps {
  readonly Heading: 'h1';
  readonly onCreateNotebook?: () => void;
}

export const EmptyWorkspaceCta = ({
  Heading,
  onCreateNotebook = noop,
}: EmptyWorkspaceCtaProps): ReturnType<FC> => {
  return (
    <div css={styles}>
      <img css={{ gridRow: 'banner' }} alt="" src={computerScreen} />
      <Heading css={css(h1, { gridRow: 'heading' })}>
        Start modelling right away
      </Heading>
      <p
        css={css(p14Regular, {
          ...setCssVar('currentTextColor', cssVar('weakTextColor')),
          gridRow: 'text',
        })}
      >
        Start modelling your finances, runway and others
      </p>
      <div css={{ gridRow: 'button' }}>
        <Button primary onClick={onCreateNotebook}>
          Create new notebook
        </Button>
      </div>
    </div>
  );
};
