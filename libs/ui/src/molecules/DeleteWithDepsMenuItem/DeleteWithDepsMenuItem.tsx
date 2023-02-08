import { BlocksInUseInformation } from '@decipad/computer';
import { useThemeFromStore } from '@decipad/react-contexts';
import { noop } from '@decipad/utils';
import { css } from '@emotion/react';
import { FC, useCallback } from 'react';
import { MenuItem, Tooltip } from '../../atoms';
import { Warning } from '../../icons';
import {
  animationTwoColours,
  antiwiggle,
  cssVar,
  p12Medium,
  purple300,
  purple700,
  transparency,
  wiggle,
} from '../../primitives';

interface DeleteWithDepsMenuItemProps {
  readonly blockInfo: BlocksInUseInformation;
  readonly onSelect?: () => void;
}

export const DeleteWithDepsMenuItem: FC<DeleteWithDepsMenuItemProps> = ({
  blockInfo,
  onSelect = noop,
}) => {
  const nextBlockIdToFix = blockInfo.usedInBlockId[0];
  const blocksAffected = blockInfo.usedInBlockId.length;
  const [isDarkMode] = useThemeFromStore();
  const selectedColor = isDarkMode ? purple700 : purple300;
  const boxShadowSpread = 15;

  const onClick = useCallback(
    (ev: any) => {
      const scaleUp = [
        {
          boxShadow: `${transparency(selectedColor, 0.4).rgba} 0px ${
            5 + boxShadowSpread
          }px 2px -${boxShadowSpread}px, ${
            transparency(selectedColor, 0.3).rgba
          } 0px ${10 + boxShadowSpread}px 2px -${boxShadowSpread}px, ${
            transparency(selectedColor, 0.2).rgba
          } 0px ${15 + boxShadowSpread}px 2px -${boxShadowSpread}px, ${
            transparency(selectedColor, 0.1).rgba
          } 0px ${20 + boxShadowSpread}px 2px -${boxShadowSpread}px, ${
            transparency(selectedColor, 0.04).rgba
          } 0px ${25 + boxShadowSpread}px 2px -${boxShadowSpread}px`,
          zIndex: 999,
        },
        {
          boxShadow: `unset`,
          zIndex: 1,
        },
        { zIndex: 'unset' },
      ];
      const scaleTime = {
        duration: 2000,
        iterations: 1,
      };
      if (typeof nextBlockIdToFix === 'string') {
        const el = document.getElementById(nextBlockIdToFix);
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el?.focus();
        setTimeout(() => el?.animate(scaleUp, scaleTime), 500);
        ev.preventDefault();
        ev.stopPropagation();
      }
    },
    [nextBlockIdToFix, selectedColor]
  );

  return (
    <MenuItem icon={<Warning />} onSelect={onSelect}>
      <Tooltip
        trigger={
          <div css={deleteWithDepsWrapperStyles}>
            <span>Delete</span>
            <a
              href={`#${nextBlockIdToFix}`}
              css={deleteWithDepsMenuItemStyles}
              onClick={onClick}
            >
              {blocksAffected}
            </a>
          </div>
        }
      >
        <p
          css={css({
            textAlign: 'center',
            maxWidth: '170px',
          })}
        >
          Deleting this block will affect {blocksAffected} other places. 😢
        </p>
        <p
          css={css({
            textAlign: 'center',
            maxWidth: '170px',
          })}
        >
          Remove references before deleting by clicking the
          <div
            css={[
              deleteWithDepsMenuItemStyles,
              { margin: '0 4px', display: 'inline-block' },
            ]}
          >
            {blocksAffected}
          </div>
          .
        </p>
      </Tooltip>
    </MenuItem>
  );
};

const deleteWithDepsMenuItemStyles = css(p12Medium, {
  borderRadius: 4,
  backgroundColor: cssVar('notebookStateDangerLight'),
  color: cssVar('notebookStateDangerHeavy'),
  border: `1px solid ${cssVar('notebookStateDangerHeavy')}`,
  cursor: 'pointer',
  width: 17,
  height: 17,
  textAlign: 'center',
  ':hover': {
    animation: `${antiwiggle} 0.5s ease-in-out,
${animationTwoColours(
  'background-color',
  cssVar('notebookStateDangerLight'),
  cssVar('notebookStateWarningLight')
)} 0.5s ease-in-out`,
  },

  ':hover:after': {
    backgroundColor: 'blue',
    animation: `${wiggle} 0.5s ease-in-out`,
  },
});

const deleteWithDepsWrapperStyles = css({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});
