import stringify from 'json-stringify-safe';
import {
  availableFlags,
  FEATURE_FLAGS_KEY,
  Flags,
  getLocalStorageOverrides,
  isFlagEnabled,
} from '@decipad/feature-flags';
import { useWindowListener } from '@decipad/react-utils';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { useState } from 'react';
import { Button } from '../../atoms';
import { black, cssVar, h2, transparency } from '../../primitives';

const setItem =
  'localStorage' in global
    ? global.localStorage.setItem.bind(global.localStorage)
    : noop;

const styles = css({
  position: 'absolute',
  zIndex: '9999',
  display: 'flex',
  flexDirection: 'column',

  borderRadius: '0 16px 16px',
  padding: '24px 40px',
  boxShadow: `2px 2px 16px 0px ${transparency(black, 0.06).rgba}`,

  background: cssVar('backgroundColor'),
});

const flagsStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',

  margin: '16px 0 24px 0',
});

const flagStyles = css({
  display: 'flex',
  gap: '4px',
});

export const FeatureFlagsSwitcher = () => {
  const [flags, setFlags] = useState<Flags>(getLocalStorageOverrides);

  const [show, setShow] = useState<boolean>(false);
  useWindowListener(
    'keydown',
    (event: KeyboardEvent) => {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key?.toLowerCase() === 'f'
      ) {
        setShow((prevShow) => !prevShow);
      }
    },
    true
  );

  return show ? (
    <div css={styles}>
      <h2 css={h2}>Feature Flags</h2>
      <div css={flagsStyles}>
        {availableFlags.map((flag) => (
          <label key={flag} css={flagStyles}>
            <input
              type="checkbox"
              disabled={flag === 'FEATURE_FLAG_SWITCHER'} // So you cannot disable the switcher itself
              checked={flags[flag] != null ? flags[flag] : isFlagEnabled(flag)}
              onChange={(e) => {
                setFlags((prevFlags) => ({
                  ...prevFlags,
                  [flag]: Boolean(e.target.checked),
                }));
              }}
            />
            {flag}
          </label>
        ))}
      </div>
      <Button
        type="primary"
        onClick={() => {
          setItem(FEATURE_FLAGS_KEY, stringify(flags));
          setFlags({});
          window.location.reload();
        }}
      >
        Save & Reload
      </Button>
    </div>
  ) : null;
};
