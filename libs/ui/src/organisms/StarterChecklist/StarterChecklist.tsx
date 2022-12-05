import { StarterChecklistType } from '@decipad/react-contexts';
import { css } from '@emotion/react';
import { nanoid } from 'nanoid';
import { FC, useCallback, useMemo, useState } from 'react';
import { Button } from '../../atoms';
import { Checkbox } from '../../atoms/Checkbox/Checkbox';
import { Caret } from '../../icons';
import { Progress } from '../../molecules/Progress/Progress';
import {
  cssVar,
  mediumShadow,
  p14Medium,
  p14Regular,
  p16Medium,
} from '../../primitives';
import { hideOnPrint } from '../../styles/editor-layout';
import { useEventNoEffect } from '../../utils/useEventNoEffect';

const wrapperStyles = css({
  width: 356,
  height: 400,
  position: 'fixed',
  bottom: 0,
  left: 0,
  padding: 16,
  transition: 'all 0.75s',
  zIndex: 2,
});

const innerStyles = css({
  width: '100%',
  height: '100%',
  backgroundColor: cssVar('highlightColor'),
  borderRadius: 8,
  padding: 16,
  boxShadow: `0px 0px 13px 13px ${mediumShadow.rgba}`,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  overflow: 'hidden',
  transition: 'all 0.5s ease-in',
});

const checklistDropdown = css(p16Medium, {
  backgroundColor: cssVar('strongHighlightColor'),
  borderRadius: 8,
  paddingLeft: 8,
  paddingRight: 8,
  display: 'flex',
  alignSelf: 'flex-start',
  maxHeight: 36,
  alignItems: 'center',
  cursor: 'pointer',
});

const checklistStyles = css({
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

const buttonStyles = css({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'end',
  alignItems: 'center',
  height: '100%',
});

const iconStyles = css({
  width: 16,
  height: 16,
});

export interface StarterChecklistProps {
  readonly checklist: StarterChecklistType;
  readonly onHideChecklist: () => void;
}

const COLLAPSED_HEIGHT = '160px';

export const StarterChecklist: FC<StarterChecklistProps> = ({
  checklist,
  onHideChecklist,
}) => {
  // small height - tucked into the corner
  const [hide, setHide] = useState(checklist.confettiUsed);

  const GetPercentage = () => {
    return (
      (Object.values(checklist.items).filter((v) => v.state).length /
        Object.values(checklist.items).length) *
      100
    );
  };

  const values = useMemo(
    () => Object.values(checklist.items),
    [checklist.items]
  );

  const toggleHide = useEventNoEffect(
    useCallback(() => setHide((h) => !h), [])
  );

  return (
    <div
      css={[wrapperStyles, hideOnPrint, hide && { height: COLLAPSED_HEIGHT }]}
    >
      <div css={innerStyles}>
        <div css={checklistDropdown} onClick={toggleHide}>
          <p>👋 Welcome to Decipad!</p>
          <div
            css={[
              iconStyles,
              { transition: 'all 0.75s' },
              hide && { transform: 'rotate(180deg)' },
            ]}
          >
            <Caret variant="up" color="normal" />
          </div>
        </div>
        {hide ? (
          <div>
            <p>
              {values.find((v) => !v.state)
                ? `Next up - ${values.find((v) => !v.state)?.text}`
                : 'All done!'}
            </p>
            <Progress
              progress={GetPercentage()}
              label={`${Math.floor(GetPercentage())}%
                  ${Math.floor(GetPercentage()) === 100 ? '🎉' : ''}`}
            />
          </div>
        ) : (
          <>
            <div css={checklistStyles}>
              <p css={[p14Regular, { color: cssVar('weakTextColor') }]}>
                You're in the interactive notebook — browse all contents of this
                notebook and interact with them to see a result.
              </p>
              <p css={p14Medium}>
                We've prepared a checklist for you to try right now:
              </p>
              <div css={[checklistStyles, { gap: 8 }]}>
                {values.map((v) => (
                  <div
                    key={nanoid()}
                    css={{
                      display: 'flex',
                      gap: 4,
                    }}
                  >
                    <Checkbox checked={v.state} />
                    <p
                      css={
                        v.state && {
                          textDecoration: 'line-through',
                        }
                      }
                    >
                      {v.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div css={buttonStyles}>
              <div>
                <Button type="text" onClick={onHideChecklist}>
                  Hide this forever
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
