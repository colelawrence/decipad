import {
  availableFlags,
  FEATURE_FLAGS_KEY,
  Flags,
  getLocalStorageOverrides,
  isFlagEnabled,
} from '@decipad/feature-flags';
import { noop } from '@decipad/utils';
import * as Popover from '@radix-ui/react-popover';
import stringify from 'json-stringify-safe';
import { useState } from 'react';
import { Button, Toggle } from '../../../shared';
import * as Styled from '../styles';

const setItem =
  'localStorage' in global
    ? global.localStorage.setItem.bind(global.localStorage)
    : noop;

export const FeatureFlagsSwitcher = () => {
  const [flags, setFlags] = useState<Flags>(getLocalStorageOverrides);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Styled.Trigger>Feature Flags</Styled.Trigger>
      </Popover.Trigger>
      <Popover.Content asChild align="end" sideOffset={16}>
        <Styled.Wrapper>
          {availableFlags
            .filter((i) => i !== 'DEVELOPER_TOOLBAR')
            .map((flag) => (
              <Styled.ToggleLabel key={flag}>
                <Toggle
                  variant="checkbox"
                  active={
                    flags[flag] != null ? flags[flag] : isFlagEnabled(flag)
                  }
                  ariaRoleDescription={`Toggle ${flag}`}
                  onChange={(value) => {
                    setFlags((prev) => ({
                      ...prev,
                      [flag]: value,
                    }));
                  }}
                />
                {flag}
              </Styled.ToggleLabel>
            ))}

          <Button
            type="tertiaryAlt"
            onClick={() => {
              setItem(FEATURE_FLAGS_KEY, stringify(flags));
              window.location.reload();
            }}
          >
            Save & Reload
          </Button>
        </Styled.Wrapper>
      </Popover.Content>
    </Popover.Root>
  );
};
