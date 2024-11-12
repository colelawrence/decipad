import { FC } from 'react';
import { ConnectionProps } from '../types';
import { Divider, Input, Link, UIGoogleSheetConnection } from '@decipad/ui';
import { Loading, OAuthConnections } from '../shared';
import { FromUrl } from './FromUrl';
import styled from '@emotion/styled';
import { assert } from '@decipad/utils';
import { GSheetRunner } from '../../runners';
import { debounce } from 'lodash';

export const GoogleSheetConnection: FC<ConnectionProps> = (props) => {
  assert(props.runner instanceof GSheetRunner);
  const { runner } = props;

  const run = debounce(() => {
    try {
      runner.assertedOptions();
    } catch {
      return;
    }
    props.onRun();
  }, 600);

  return (
    <UIGoogleSheetConnection>
      <p>
        See our documentation for more information on connecting your data.
        <Link
          color="plain"
          href="https://app.decipad.com/docs/integrations/google-sheets"
        >
          Check our docs
        </Link>
      </p>
      <h3>Select connection</h3>
      <OAuthConnections
        {...props}
        label="Select Connection"
        provider="gsheets"
      />
      <Divider />
      <FromUrl {...props} />
      <Loading info={props.info} />
      <Divider />
      <InputsWrapper>
        <Input
          label="Input cell range (optional)"
          placeholder="e.g A1:D40"
          variant="small"
          pattern="([A-z]+\d+):([A-z]+\d+)"
          onChange={(v) => {
            const value = v.currentTarget.value.toUpperCase();
            const range = GSheetRunner.parseRange(value);
            if (!range) return;
            runner.setOptions({
              runner: {
                range: value,
              },
              importer: { ...runner.options.importer, range },
            });
            run();
          }}
        />
      </InputsWrapper>
    </UIGoogleSheetConnection>
  );
};

const InputsWrapper = styled.section({
  // display: 'grid',
  // gridTemplateColumns: 'max-content 1fr',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  gap: '8px',
});
